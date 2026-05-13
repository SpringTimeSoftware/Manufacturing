using System.Data;
using System.Text.Json;
using Dapper;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Abstractions.Platform;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Platform;
using STS.Mfg.Application.Exceptions;

namespace STS.Mfg.Infrastructure.Platform;

public sealed class PlatformRuntimeService(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IDataScopeService dataScopeService,
    IAuditTrail auditTrail) : IPlatformRuntimeService
{
    private static readonly JsonSerializerOptions SnapshotSerializerOptions = new(JsonSerializerDefaults.Web);

    private static readonly string[] RecoveryChallenges =
    {
        "Password reset link",
        "Recovery code rotation",
        "Helpdesk callback verification"
    };

    public async Task<ForgotPasswordResponse> RequestForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var token = $"reset-{Guid.NewGuid():N}";
        var expiresOn = DateTimeOffset.UtcNow.AddMinutes(20);
        var deliverySummary = request.Channel switch
        {
            "Email" => "A signed reset link and MFA recovery instructions were drafted to the registered mailbox.",
            "SMS" => "A recovery code draft was queued for the verified mobile number on file.",
            _ => "The next sign-in will prompt for authenticator recovery using the stored device challenge."
        };

        const string sql = """
            INSERT INTO platform.PasswordResetRequests
                (RequestToken, UserNameOrEmail, CompanyCode, Channel, RecoveryMode, DeliverySummary, AvailableChallengesJson, ExpiresOnUtc, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
            VALUES
                (@Token, @UserNameOrEmail, @CompanyCode, @Channel, @RecoveryMode, @DeliverySummary, @AvailableChallengesJson, @ExpiresOnUtc, N'Requested', SYSUTCDATETIME(), NULL, SYSUTCDATETIME(), NULL);
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                Token = token,
                request.UserNameOrEmail,
                request.CompanyCode,
                request.Channel,
                request.RecoveryMode,
                DeliverySummary = deliverySummary,
                AvailableChallengesJson = JsonSerializer.Serialize(RecoveryChallenges),
                ExpiresOnUtc = expiresOn
            },
            cancellationToken: cancellationToken));

        return new ForgotPasswordResponse(
            token,
            $"Recovery guidance was prepared for {request.UserNameOrEmail}.",
            deliverySummary,
            RecoveryChallenges,
            expiresOn,
            "/api/auth/forgot-password");
    }

    public async Task<IReadOnlyCollection<NotificationItem>> ListNotificationsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT TOP (100)
                COALESCE(NotificationKey, CONVERT(NVARCHAR(32), Id)) AS Id,
                COALESCE(Title, TemplateCode) AS Title,
                COALESCE(Body, PayloadJson) AS Body,
                COALESCE(Module, RelatedDocumentType, N'Platform') AS Module,
                Category,
                COALESCE(Severity, N'info') AS Severity,
                CreatedOn AS CreatedAt,
                CAST(COALESCE(IsRead, 0) AS bit) AS IsRead,
                CAST(COALESCE(RequiresAction, 0) AS bit) AS RequiresAction,
                DocumentRef,
                AuditActionLabel,
                StatusLabel,
                ActionLabel,
                ActionPath
            FROM platform.Notifications
            WHERE Title IS NOT NULL
              AND (
                  @HasDeploymentAccess = 1
                  OR (
                      (@CompanyId IS NULL OR CompanyId IS NULL OR CompanyId = @CompanyId)
                      AND (@BranchId IS NULL OR BranchId IS NULL OR BranchId = @BranchId)
                  )
              )
            ORDER BY CreatedOn DESC, Id DESC;
            """;

        var scope = dataScopeService.GetCurrentScope();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<NotificationItem>(new CommandDefinition(
            sql,
            new
            {
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                BranchId = scope.ActiveBranchId
            },
            cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<ActionResponse> MarkNotificationReadAsync(string id, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE platform.Notifications
            SET IsRead = 1,
                ReadOn = COALESCE(ReadOn, SYSUTCDATETIME()),
                ModifiedOn = SYSUTCDATETIME()
            WHERE (NotificationKey = @Id OR CONVERT(NVARCHAR(32), Id) = @Id)
              AND (
                  @HasDeploymentAccess = 1
                  OR (
                      (@CompanyId IS NULL OR CompanyId IS NULL OR CompanyId = @CompanyId)
                      AND (@BranchId IS NULL OR BranchId IS NULL OR BranchId = @BranchId)
                  )
              );
            """;

        var scope = dataScopeService.GetCurrentScope();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                Id = id,
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                BranchId = scope.ActiveBranchId
            },
            cancellationToken: cancellationToken));

        if (affected > 0)
        {
            await WriteAuditAsync(
                "Notification",
                "platform.notification.read",
                id,
                new { id, status = "Read" },
                cancellationToken);
        }

        return new ActionResponse(id, affected > 0 ? "Read" : "NotFound", id, Array.Empty<string>());
    }

    public async Task<ActionResponse> MarkAllNotificationsReadAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE platform.Notifications
            SET IsRead = 1,
                ReadOn = COALESCE(ReadOn, SYSUTCDATETIME()),
                ModifiedOn = SYSUTCDATETIME()
            WHERE Title IS NOT NULL
              AND IsRead = 0
              AND (
                  @HasDeploymentAccess = 1
                  OR (
                      (@CompanyId IS NULL OR CompanyId IS NULL OR CompanyId = @CompanyId)
                      AND (@BranchId IS NULL OR BranchId IS NULL OR BranchId = @BranchId)
                  )
              );
            """;

        var scope = dataScopeService.GetCurrentScope();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                BranchId = scope.ActiveBranchId
            },
            cancellationToken: cancellationToken));

        if (affected > 0)
        {
            await WriteAuditAsync(
                "Notification",
                "platform.notification.read_all",
                "notifications",
                new { affected, status = "Read" },
                cancellationToken);
        }

        return new ActionResponse("notifications", "Read", affected.ToString(), Array.Empty<string>());
    }

    public async Task<IReadOnlyCollection<ApprovalWorkItem>> ListApprovalsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                WorkItemKey AS Id,
                Module,
                DocumentType,
                ReferenceNo,
                Title,
                Summary,
                SubmittedBy,
                SubmittedOn,
                DueOn,
                Status,
                Priority,
                StepName,
                AuditActionLabel,
                RelatedNotificationKey AS RelatedNotificationId,
                ActionPath,
                TagsJson
            FROM platform.ApprovalWorkItems
            WHERE
                @HasDeploymentAccess = 1
                OR (
                    (@CompanyId IS NULL OR CompanyId IS NULL OR CompanyId = @CompanyId)
                    AND (@BranchId IS NULL OR BranchId IS NULL OR BranchId = @BranchId)
                )
            ORDER BY
                CASE WHEN Status = N'Escalated' THEN 0 WHEN Status = N'Pending' THEN 1 ELSE 2 END,
                DueOn,
                Id;
            """;

        var scope = dataScopeService.GetCurrentScope();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<ApprovalRow>(new CommandDefinition(
            sql,
            new
            {
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                BranchId = scope.ActiveBranchId
            },
            cancellationToken: cancellationToken));
        return rows.Select(row => new ApprovalWorkItem(
                row.Id,
                row.Module,
                row.DocumentType,
                row.ReferenceNo,
                row.Title,
                row.Summary,
                row.SubmittedBy,
                row.SubmittedOn,
                row.DueOn,
                row.Status,
                row.Priority,
                row.StepName,
                row.AuditActionLabel,
                row.RelatedNotificationId,
                row.ActionPath,
                ParseJsonStringArray(row.TagsJson)))
            .ToArray();
    }

    public async Task<ActionResponse> SubmitApprovalDecisionAsync(
        string id,
        ApprovalDecisionRequest request,
        CancellationToken cancellationToken = default)
    {
        var nextStatus = request.Decision switch
        {
            "Approve" => "Approved",
            "Reject" => "Rejected",
            "RequestChanges" => "Changes Requested",
            _ => request.Decision
        };

        const string sql = """
            DECLARE @workItemId BIGINT;
            DECLARE @referenceNo NVARCHAR(128);
            DECLARE @relatedNotificationKey NVARCHAR(128);

            SELECT
                @workItemId = Id,
                @referenceNo = ReferenceNo,
                @relatedNotificationKey = RelatedNotificationKey
            FROM platform.ApprovalWorkItems
            WHERE WorkItemKey = @Id
              AND (
                  @HasDeploymentAccess = 1
                  OR (
                      (@CompanyId IS NULL OR CompanyId IS NULL OR CompanyId = @CompanyId)
                      AND (@BranchId IS NULL OR BranchId IS NULL OR BranchId = @BranchId)
                  )
              );

            IF @workItemId IS NOT NULL
            BEGIN
                UPDATE platform.ApprovalWorkItems
                SET Status = @NextStatus,
                    ModifiedOn = SYSUTCDATETIME(),
                    ModifiedByUserId = @UserId
                WHERE Id = @workItemId;

                INSERT INTO platform.ApprovalDecisions
                    (ApprovalWorkItemId, Decision, Remarks, DecidedOn, DecidedByUserId, CreatedOn)
                VALUES
                    (@workItemId, @Decision, @Remarks, SYSUTCDATETIME(), @UserId, SYSUTCDATETIME());

                IF @relatedNotificationKey IS NOT NULL
                BEGIN
                    UPDATE platform.Notifications
                    SET IsRead = 1,
                        ReadOn = COALESCE(ReadOn, SYSUTCDATETIME()),
                        ModifiedOn = SYSUTCDATETIME(),
                        ModifiedByUserId = @UserId
                    WHERE NotificationKey = @relatedNotificationKey;
                END;
            END;

            SELECT @workItemId AS WorkItemId, COALESCE(@referenceNo, @Id) AS ReferenceNo;
            """;

        var current = currentUserContextAccessor.GetCurrent();
        var scope = dataScopeService.GetCurrentScope();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var result = await connection.QuerySingleAsync<ApprovalDecisionResult>(new CommandDefinition(
            sql,
            new
            {
                Id = id,
                request.Decision,
                request.Remarks,
                NextStatus = nextStatus,
                current.UserId,
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                BranchId = scope.ActiveBranchId
            },
            cancellationToken: cancellationToken));

        if (result.WorkItemId.HasValue)
        {
            await WriteAuditAsync(
                "ApprovalWorkItem",
                "platform.approval.decision",
                result.WorkItemId.Value.ToString(System.Globalization.CultureInfo.InvariantCulture),
                new
                {
                    id,
                    result.ReferenceNo,
                    request.Decision,
                    Status = nextStatus,
                    request.Remarks
                },
                cancellationToken);
        }

        return new ActionResponse(
            id,
            result.WorkItemId.HasValue ? nextStatus : "NotFound",
            result.ReferenceNo ?? id,
            Array.Empty<string>());
    }

    public async Task<IReadOnlyCollection<UserDirectoryItem>> ListUsersAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                CONCAT(N'user-', u.Id) AS Id,
                u.UserName,
                u.DisplayName,
                COALESCE(u.Email, N'') AS Email,
                u.Status,
                COALESCE(u.LoginPolicy, N'Policy pending') AS LoginPolicy,
                COALESCE(u.LastLoginText, N'Not yet signed in') AS LastLogin,
                COALESCE(u.DeviceBinding, N'No device bound') AS DeviceBinding,
                STRING_AGG(CONVERT(NVARCHAR(MAX), r.RoleCode), N',') AS RolesCsv,
                STRING_AGG(CONVERT(NVARCHAR(MAX), COALESCE(b.BranchCode, c.CompanyCode, N'Tenant')), N',') AS BranchAccessCsv
            FROM platform.AppUsers u
            LEFT JOIN platform.UserRoles ur ON ur.UserId = u.Id
            LEFT JOIN platform.Roles r ON r.Id = ur.RoleId
            LEFT JOIN org.Branches b ON b.Id = ur.BranchId
            LEFT JOIN org.Companies c ON c.Id = ur.CompanyId
            WHERE
                @HasDeploymentAccess = 1
                OR EXISTS (
                    SELECT 1
                    FROM platform.UserRoles scopedRole
                    WHERE scopedRole.UserId = u.Id
                      AND (@CompanyId IS NULL OR scopedRole.CompanyId IS NULL OR scopedRole.CompanyId = @CompanyId)
                      AND (@BranchId IS NULL OR scopedRole.BranchId IS NULL OR scopedRole.BranchId = @BranchId)
                )
            GROUP BY u.Id, u.UserName, u.DisplayName, u.Email, u.Status, u.LoginPolicy, u.LastLoginText, u.DeviceBinding
            ORDER BY u.DisplayName;
            """;

        var scope = dataScopeService.GetCurrentScope();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<UserRow>(new CommandDefinition(
            sql,
            new
            {
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                BranchId = scope.ActiveBranchId
            },
            cancellationToken: cancellationToken));
        return rows.Select(row => new UserDirectoryItem(
                row.Id,
                row.UserName,
                row.DisplayName,
                row.Email,
                SplitCsv(row.RolesCsv),
                SplitCsv(row.BranchAccessCsv),
                row.Status,
                row.LoginPolicy,
                row.LastLogin,
                row.DeviceBinding))
            .ToArray();
    }

    public async Task<IReadOnlyCollection<RoleMatrixItem>> ListRolesAsync(CancellationToken cancellationToken = default)
    {
        const string roleSql = """
            SELECT
                CONCAT(N'role-', RoleCode) AS Id,
                RoleCode,
                RoleName AS Label,
                COALESCE(Audience, N'') AS Audience,
                ScopeMode,
                (SELECT COUNT(DISTINCT ur.UserId) FROM platform.UserRoles ur WHERE ur.RoleId = r.Id) AS ActiveUsers,
                COALESCE(MobileSurface, N'None') AS MobileSurface,
                Status,
                Id AS RoleId
            FROM platform.Roles r
            ORDER BY RoleCode;
            """;

        const string permissionSql = """
            SELECT
                rp.RoleId,
                p.Module,
                p.AccessLevel AS Access,
                p.DataScope
            FROM platform.RolePermissions rp
            JOIN platform.Permissions p ON p.Id = rp.PermissionId
            ORDER BY rp.RoleId, p.Module, p.AccessLevel;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var roles = (await connection.QueryAsync<RoleRow>(new CommandDefinition(roleSql, cancellationToken: cancellationToken))).ToArray();
        var permissions = await connection.QueryAsync<RolePermissionRow>(new CommandDefinition(permissionSql, cancellationToken: cancellationToken));
        var groupedPermissions = permissions
            .GroupBy(permission => permission.RoleId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyCollection<RolePermissionItem>)group
                    .Select(permission => new RolePermissionItem(permission.Module, permission.Access, permission.DataScope))
                    .ToArray());

        return roles.Select(role => new RoleMatrixItem(
                role.Id,
                role.RoleCode,
                role.Label,
                role.Audience,
                role.ScopeMode,
                role.ActiveUsers,
                role.MobileSurface,
                role.Status,
                groupedPermissions.TryGetValue(role.RoleId, out var rolePermissions)
                    ? rolePermissions
                    : Array.Empty<RolePermissionItem>()))
            .ToArray();
    }

    public async Task<IReadOnlyCollection<WorkflowNumberingItem>> ListWorkflowRulesAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                CONCAT(N'wf-', wf.Id) AS Id,
                wf.DocumentType,
                COALESCE(ds.SeriesPattern, N'Unassigned') AS SeriesPattern,
                wf.OwnerRoleCode AS WorkflowOwner,
                wf.ApprovalChain,
                (SELECT COUNT(1) FROM platform.WorkflowTransitions wt WHERE wt.WorkflowDefinitionId = wf.Id) AS TransitionCount,
                wf.Status,
                COALESCE(wf.Notes, N'') AS Notes
            FROM platform.WorkflowDefinitions wf
            LEFT JOIN platform.DocumentSeries ds
                ON ds.DocumentType = wf.DocumentType
                AND ISNULL(ds.CompanyId, 0) = ISNULL(wf.CompanyId, 0)
                AND ISNULL(ds.BranchId, 0) = ISNULL(wf.BranchId, 0)
            ORDER BY wf.DocumentType;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<WorkflowNumberingItem>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<IReadOnlyCollection<TenantSettingItem>> ListTenantSettingsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                CONCAT(N'setting-', Id) AS Id,
                SettingGroup AS [Group],
                SettingKey AS [Key],
                SettingLabel AS Label,
                SettingValue AS [Value],
                Status,
                COALESCE(Description, N'') AS Description
            FROM platform.PlatformSettings
            ORDER BY SettingGroup, SettingKey;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<TenantSettingItem>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<ApprovalDetailDto> GetApprovalDetailAsync(string id, CancellationToken cancellationToken = default)
    {
        var workItem = (await ListApprovalsAsync(cancellationToken))
            .FirstOrDefault(item => string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase))
            ?? throw new ResourceNotFoundException("Approval work item is not available in the current operating scope.", "approvals.not_found");

        const string sql = """
            SELECT
                d.Id,
                d.Decision,
                d.Remarks,
                d.DecidedOn,
                d.DecidedByUserId
            FROM platform.ApprovalDecisions d
            JOIN platform.ApprovalWorkItems wi ON wi.Id = d.ApprovalWorkItemId
            WHERE wi.WorkItemKey = @Id
            ORDER BY d.DecidedOn DESC, d.Id DESC;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var decisions = await connection.QueryAsync<ApprovalDecisionDto>(new CommandDefinition(
            sql,
            new { Id = id },
            cancellationToken: cancellationToken));

        return new ApprovalDetailDto(workItem, decisions.ToArray());
    }

    public async Task<UserDirectoryItem> UpdateUserAccessPolicyAsync(
        string id,
        UserAccessPolicyUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = ParsePrefixedId(id, "user-");
        ValidateUserAccessPolicy(request);

        const string updateSql = """
            UPDATE platform.AppUsers
            SET DisplayName = @DisplayName,
                Email = @Email,
                LanguageCode = @LanguageCode,
                DefaultCompanyId = @DefaultCompanyId,
                DefaultBranchId = @DefaultBranchId,
                Status = @Status,
                LoginPolicy = @LoginPolicy,
                DeviceBinding = @DeviceBinding,
                ModifiedOn = SYSUTCDATETIME(),
                ModifiedByUserId = @ActorUserId
            WHERE Id = @UserId;
            """;

        const string deleteRolesSql = "DELETE FROM platform.UserRoles WHERE UserId = @UserId;";
        const string insertRoleSql = """
            INSERT INTO platform.UserRoles (UserId, RoleId, CompanyId, BranchId, CreatedOn, CreatedByUserId)
            SELECT @UserId, r.Id, @CompanyId, @BranchId, SYSUTCDATETIME(), @ActorUserId
            FROM platform.Roles r
            WHERE r.RoleCode = @RoleCode
              AND NOT EXISTS (
                  SELECT 1
                  FROM platform.UserRoles existing
                  WHERE existing.UserId = @UserId
                    AND existing.RoleId = r.Id
                    AND ISNULL(existing.CompanyId, -1) = ISNULL(@CompanyId, -1)
                    AND ISNULL(existing.BranchId, -1) = ISNULL(@BranchId, -1)
              );
            """;

        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        using var transaction = connection.BeginTransaction();

        var affected = await connection.ExecuteAsync(new CommandDefinition(
            updateSql,
            new
            {
                UserId = userId,
                request.DisplayName,
                request.Email,
                request.LanguageCode,
                request.DefaultCompanyId,
                request.DefaultBranchId,
                request.Status,
                request.LoginPolicy,
                request.DeviceBinding,
                ActorUserId = current.UserId
            },
            transaction,
            cancellationToken: cancellationToken));

        if (affected == 0)
        {
            throw new ResourceNotFoundException("User access policy is not available for update.", "users.not_found");
        }

        await connection.ExecuteAsync(new CommandDefinition(
            deleteRolesSql,
            new { UserId = userId },
            transaction,
            cancellationToken: cancellationToken));

        foreach (var assignment in request.Roles)
        {
            var inserted = await connection.ExecuteAsync(new CommandDefinition(
                insertRoleSql,
                new
                {
                    UserId = userId,
                    assignment.RoleCode,
                    assignment.CompanyId,
                    assignment.BranchId,
                    ActorUserId = current.UserId
                },
                transaction,
                cancellationToken: cancellationToken));

            if (inserted == 0)
            {
                throw new ValidationFailureException([
                    new ApiError("validation.lookup", nameof(assignment.RoleCode), $"Role '{assignment.RoleCode}' is not available.")
                ]);
            }
        }

        transaction.Commit();

        await WriteAuditAsync(
            "AppUser",
            "platform.user.access_policy.update",
            userId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return (await ListUsersAsync(cancellationToken))
            .First(user => string.Equals(user.Id, $"user-{userId}", StringComparison.OrdinalIgnoreCase));
    }

    public async Task<ActionResponse> RequestUserAccessResetAsync(string id, CancellationToken cancellationToken = default)
    {
        var userId = ParsePrefixedId(id, "user-");
        const string sql = """
            UPDATE platform.AppUsers
            SET LoginPolicy = N'Admin reset pending',
                DeviceBinding = N'Reset requested',
                ModifiedOn = SYSUTCDATETIME(),
                ModifiedByUserId = @ActorUserId
            WHERE Id = @UserId;
            """;

        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new { UserId = userId, ActorUserId = current.UserId },
            cancellationToken: cancellationToken));

        if (affected == 0)
        {
            throw new ResourceNotFoundException("User access reset could not find the selected user.", "users.not_found");
        }

        await WriteAuditAsync(
            "AppUser",
            "platform.user.access_reset.request",
            userId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            new { userId, status = "Reset requested" },
            cancellationToken);

        return new ActionResponse(id, "ResetRequested", id, Array.Empty<string>());
    }

    public async Task<IReadOnlyCollection<PermissionCatalogItemDto>> ListPermissionsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                CONCAT(N'permission-', Id) AS Id,
                PermissionCode,
                Module,
                AccessLevel AS Access,
                DataScope,
                Status
            FROM platform.Permissions
            ORDER BY Module, AccessLevel, PermissionCode;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<PermissionCatalogItemDto>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<RoleMatrixItem> CreateRoleAsync(RoleUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRole(request);

        const string sql = """
            INSERT INTO platform.Roles
                (RoleCode, RoleName, Audience, ScopeMode, MobileSurface, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
            VALUES
                (@RoleCode, @Label, @Audience, @ScopeMode, N'None', @Status, SYSUTCDATETIME(), @ActorUserId, SYSUTCDATETIME(), @ActorUserId);
            SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
            """;

        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        using var transaction = connection.BeginTransaction();
        var roleId = await connection.ExecuteScalarAsync<long>(new CommandDefinition(
            sql,
            new
            {
                request.RoleCode,
                request.Label,
                request.Audience,
                request.ScopeMode,
                request.Status,
                ActorUserId = current.UserId
            },
            transaction,
            cancellationToken: cancellationToken));

        await ReplaceRolePermissionsAsync(connection, transaction, roleId, request.Permissions, current.UserId, cancellationToken);
        transaction.Commit();

        await WriteAuditAsync(
            "Role",
            "platform.role.create",
            roleId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return await GetRoleByCodeAsync(request.RoleCode, cancellationToken);
    }

    public async Task<RoleMatrixItem> UpdateRoleAsync(
        string id,
        RoleUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateRole(request);
        var roleCode = ParseRoleCode(id);

        const string lookupSql = "SELECT Id FROM platform.Roles WHERE RoleCode = @RoleCode;";
        const string updateSql = """
            UPDATE platform.Roles
            SET RoleName = @Label,
                Audience = @Audience,
                ScopeMode = @ScopeMode,
                Status = @Status,
                ModifiedOn = SYSUTCDATETIME(),
                ModifiedByUserId = @ActorUserId
            WHERE RoleCode = @ExistingRoleCode;
            """;

        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        using var transaction = connection.BeginTransaction();

        var roleId = await connection.ExecuteScalarAsync<long?>(new CommandDefinition(
            lookupSql,
            new { RoleCode = roleCode },
            transaction,
            cancellationToken: cancellationToken));

        if (!roleId.HasValue)
        {
            throw new ResourceNotFoundException("Role is not available for update.", "roles.not_found");
        }

        await connection.ExecuteAsync(new CommandDefinition(
            updateSql,
            new
            {
                ExistingRoleCode = roleCode,
                request.Label,
                request.Audience,
                request.ScopeMode,
                request.Status,
                ActorUserId = current.UserId
            },
            transaction,
            cancellationToken: cancellationToken));

        await ReplaceRolePermissionsAsync(connection, transaction, roleId.Value, request.Permissions, current.UserId, cancellationToken);
        transaction.Commit();

        await WriteAuditAsync(
            "Role",
            "platform.role.update",
            roleId.Value.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return await GetRoleByCodeAsync(roleCode, cancellationToken);
    }

    public async Task<RoleMatrixItem> CloneRoleAsync(
        string id,
        RoleUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        var sourceRoleCode = ParseRoleCode(id);
        var permissions = request.Permissions.Count > 0
            ? request.Permissions
            : await GetRolePermissionAssignmentsAsync(sourceRoleCode, cancellationToken);
        var cloneRequest = request with { Permissions = permissions };
        return await CreateRoleAsync(cloneRequest, cancellationToken);
    }

    public async Task<WorkflowNumberingItem> UpsertWorkflowRuleAsync(
        string? id,
        WorkflowRuleUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateWorkflowRule(request);
        var workflowId = string.IsNullOrWhiteSpace(id) ? (long?)null : ParsePrefixedId(id, "wf-");
        var current = currentUserContextAccessor.GetCurrent();

        const string upsertSql = """
            DECLARE @WorkflowId BIGINT = @RequestedWorkflowId;

            IF @WorkflowId IS NULL
            BEGIN
                INSERT INTO platform.WorkflowDefinitions
                    (CompanyId, BranchId, WorkflowCode, DocumentType, OwnerRoleCode, ApprovalChain, Status, Notes, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
                VALUES
                    (@CompanyId, @BranchId, @WorkflowCode, @DocumentType, @WorkflowOwner, @ApprovalChain, @Status, @Notes, SYSUTCDATETIME(), @ActorUserId, SYSUTCDATETIME(), @ActorUserId);
                SET @WorkflowId = CAST(SCOPE_IDENTITY() AS BIGINT);
            END
            ELSE
            BEGIN
                UPDATE platform.WorkflowDefinitions
                SET WorkflowCode = @WorkflowCode,
                    DocumentType = @DocumentType,
                    OwnerRoleCode = @WorkflowOwner,
                    ApprovalChain = @ApprovalChain,
                    Status = @Status,
                    Notes = @Notes,
                    ModifiedOn = SYSUTCDATETIME(),
                    ModifiedByUserId = @ActorUserId
                WHERE Id = @WorkflowId;
            END;

            IF EXISTS (
                SELECT 1 FROM platform.DocumentSeries
                WHERE DocumentType = @DocumentType
                  AND ISNULL(CompanyId, -1) = ISNULL(@CompanyId, -1)
                  AND ISNULL(BranchId, -1) = ISNULL(@BranchId, -1)
            )
            BEGIN
                UPDATE platform.DocumentSeries
                SET SeriesPattern = @SeriesPattern,
                    CurrentNumber = @CurrentNumber,
                    ResetPolicy = @ResetPolicy,
                    Status = @Status,
                    ModifiedOn = SYSUTCDATETIME(),
                    ModifiedByUserId = @ActorUserId
                WHERE DocumentType = @DocumentType
                  AND ISNULL(CompanyId, -1) = ISNULL(@CompanyId, -1)
                  AND ISNULL(BranchId, -1) = ISNULL(@BranchId, -1);
            END
            ELSE
            BEGIN
                INSERT INTO platform.DocumentSeries
                    (CompanyId, BranchId, DocumentType, SeriesPattern, CurrentNumber, ResetPolicy, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
                VALUES
                    (@CompanyId, @BranchId, @DocumentType, @SeriesPattern, @CurrentNumber, @ResetPolicy, @Status, SYSUTCDATETIME(), @ActorUserId, SYSUTCDATETIME(), @ActorUserId);
            END;

            SELECT @WorkflowId;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var savedId = await connection.ExecuteScalarAsync<long>(new CommandDefinition(
            upsertSql,
            new
            {
                RequestedWorkflowId = workflowId,
                request.CompanyId,
                request.BranchId,
                request.WorkflowCode,
                request.DocumentType,
                request.SeriesPattern,
                request.CurrentNumber,
                request.ResetPolicy,
                request.WorkflowOwner,
                request.ApprovalChain,
                request.Status,
                request.Notes,
                ActorUserId = current.UserId
            },
            cancellationToken: cancellationToken));

        await WriteAuditAsync(
            "WorkflowDefinition",
            workflowId.HasValue ? "platform.workflow.update" : "platform.workflow.create",
            savedId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return (await ListWorkflowRulesAsync(cancellationToken))
            .First(item => string.Equals(item.Id, $"wf-{savedId}", StringComparison.OrdinalIgnoreCase));
    }

    public async Task<TenantSettingItem> UpdateTenantSettingAsync(
        string id,
        TenantSettingUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var settingId = ParsePrefixedId(id, "setting-");
        ValidateTenantSetting(request);
        const string sql = """
            UPDATE platform.PlatformSettings
            SET SettingValue = @Value,
                Status = @Status,
                Description = COALESCE(@Description, Description),
                ModifiedOn = SYSUTCDATETIME(),
                ModifiedByUserId = @ActorUserId
            WHERE Id = @SettingId;
            """;

        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new { SettingId = settingId, request.Value, request.Status, request.Description, ActorUserId = current.UserId },
            cancellationToken: cancellationToken));

        if (affected == 0)
        {
            throw new ResourceNotFoundException("Tenant setting is not available for update.", "settings.not_found");
        }

        await WriteAuditAsync(
            "PlatformSetting",
            "platform.tenant_setting.update",
            settingId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return (await ListTenantSettingsAsync(cancellationToken))
            .First(item => string.Equals(item.Id, $"setting-{settingId}", StringComparison.OrdinalIgnoreCase));
    }

    public async Task<ActionResponse> UpsertTranslationResourceAsync(
        TranslationResourceUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateTranslation(request);
        var current = currentUserContextAccessor.GetCurrent();

        const string sql = """
            DECLARE @TranslationId BIGINT;

            SELECT @TranslationId = Id
            FROM platform.Translations
            WHERE LanguageCode = @LanguageCode
              AND TranslationKey = @TranslationKey
              AND ISNULL(CompanyId, -1) = ISNULL(@CompanyId, -1)
              AND ISNULL(BranchId, -1) = ISNULL(@BranchId, -1);

            IF @TranslationId IS NULL
            BEGIN
                INSERT INTO platform.Translations
                    (CompanyId, BranchId, LanguageCode, TranslationKey, TranslationValue, Module, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
                VALUES
                    (@CompanyId, @BranchId, @LanguageCode, @TranslationKey, @TranslationValue, @Module, SYSUTCDATETIME(), @ActorUserId, SYSUTCDATETIME(), @ActorUserId);
                SET @TranslationId = CAST(SCOPE_IDENTITY() AS BIGINT);
            END
            ELSE
            BEGIN
                UPDATE platform.Translations
                SET TranslationValue = @TranslationValue,
                    Module = @Module,
                    ModifiedOn = SYSUTCDATETIME(),
                    ModifiedByUserId = @ActorUserId
                WHERE Id = @TranslationId;
            END;

            SELECT @TranslationId;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var translationId = await connection.ExecuteScalarAsync<long>(new CommandDefinition(
            sql,
            new
            {
                request.CompanyId,
                request.BranchId,
                request.LanguageCode,
                request.TranslationKey,
                request.TranslationValue,
                request.Module,
                ActorUserId = current.UserId
            },
            cancellationToken: cancellationToken));

        await WriteAuditAsync(
            "Translation",
            "platform.translation.upsert",
            translationId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return new ActionResponse(
            translationId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            "Saved",
            request.TranslationKey,
            Array.Empty<string>());
    }

    public async Task<IReadOnlyCollection<UdfDefinitionDto>> ListUdfDefinitionsAsync(
        UdfDefinitionFilter filter,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                Id,
                CompanyId,
                EntityType,
                FieldKey,
                Label,
                DataType,
                ControlType,
                LookupSource,
                IsRequired,
                MinNumber,
                MaxNumber,
                MaxLength,
                DecimalScale,
                RoleVisibility,
                Status,
                CreatedOn,
                ModifiedOn
            FROM platform.UdfDefinitions
            WHERE (@Status IS NULL OR @Status = N'all' OR Status = @Status)
              AND (@EntityType IS NULL OR @EntityType = N'all' OR EntityType = @EntityType)
              AND (
                  @HasDeploymentAccess = 1
                  OR @CompanyId IS NULL
                  OR CompanyId IS NULL
                  OR CompanyId = @CompanyId
              )
              AND (
                  @HasDeploymentAccess = 1
                  OR RoleVisibility IS NULL
                  OR RoleVisibility = N''
                  OR EXISTS (
                      SELECT 1
                      FROM STRING_SPLIT(RoleVisibility, N',') roleVisibility
                      WHERE LTRIM(RTRIM(roleVisibility.value)) IN @Roles
                  )
              )
              AND (@Search IS NULL
                   OR EntityType LIKE @Search
                   OR FieldKey LIKE @Search
                   OR Label LIKE @Search
                   OR RoleVisibility LIKE @Search)
            ORDER BY EntityType, FieldKey;
            """;

        var scope = dataScopeService.GetCurrentScope();
        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<UdfDefinitionDto>(new CommandDefinition(
            sql,
            new
            {
                Status = string.IsNullOrWhiteSpace(filter.Status) ? null : filter.Status,
                EntityType = string.IsNullOrWhiteSpace(filter.EntityType) ? null : filter.EntityType,
                Search = string.IsNullOrWhiteSpace(filter.Search) ? null : $"%{filter.Search.Trim()}%",
                scope.HasDeploymentAccess,
                CompanyId = scope.ActiveCompanyId,
                Roles = current.Roles.Count > 0 ? current.Roles : new[] { string.Empty }
            },
            cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<UdfDefinitionDto> CreateUdfDefinitionAsync(
        UdfDefinitionUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUdfDefinition(request);
        var current = currentUserContextAccessor.GetCurrent();
        const string sql = """
            INSERT INTO platform.UdfDefinitions
                (CompanyId, EntityType, FieldKey, Label, DataType, ControlType, LookupSource, IsRequired, MinNumber, MaxNumber, MaxLength, DecimalScale, RoleVisibility, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
            VALUES
                (@CompanyId, @EntityType, @FieldKey, @Label, @DataType, @ControlType, @LookupSource, @IsRequired, @MinNumber, @MaxNumber, @MaxLength, @DecimalScale, @RoleVisibility, @Status, SYSUTCDATETIME(), @ActorUserId, SYSUTCDATETIME(), @ActorUserId);
            SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var id = await connection.ExecuteScalarAsync<long>(new CommandDefinition(
            sql,
            new
            {
                request.CompanyId,
                request.EntityType,
                request.FieldKey,
                request.Label,
                request.DataType,
                request.ControlType,
                request.LookupSource,
                request.IsRequired,
                request.MinNumber,
                request.MaxNumber,
                request.MaxLength,
                request.DecimalScale,
                request.RoleVisibility,
                request.Status,
                ActorUserId = current.UserId
            },
            cancellationToken: cancellationToken));

        await WriteAuditAsync(
            "UdfDefinition",
            "platform.udf_definition.create",
            id.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return await GetUdfDefinitionAsync(id, cancellationToken);
    }

    public async Task<UdfDefinitionDto> UpdateUdfDefinitionAsync(
        long id,
        UdfDefinitionUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUdfDefinition(request);
        var current = currentUserContextAccessor.GetCurrent();
        const string sql = """
            UPDATE platform.UdfDefinitions
            SET CompanyId = @CompanyId,
                EntityType = @EntityType,
                FieldKey = @FieldKey,
                Label = @Label,
                DataType = @DataType,
                ControlType = @ControlType,
                LookupSource = @LookupSource,
                IsRequired = @IsRequired,
                MinNumber = @MinNumber,
                MaxNumber = @MaxNumber,
                MaxLength = @MaxLength,
                DecimalScale = @DecimalScale,
                RoleVisibility = @RoleVisibility,
                Status = @Status,
                ModifiedOn = SYSUTCDATETIME(),
                ModifiedByUserId = @ActorUserId
            WHERE Id = @Id;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                Id = id,
                request.CompanyId,
                request.EntityType,
                request.FieldKey,
                request.Label,
                request.DataType,
                request.ControlType,
                request.LookupSource,
                request.IsRequired,
                request.MinNumber,
                request.MaxNumber,
                request.MaxLength,
                request.DecimalScale,
                request.RoleVisibility,
                request.Status,
                ActorUserId = current.UserId
            },
            cancellationToken: cancellationToken));

        if (affected == 0)
        {
            throw new ResourceNotFoundException("UDF definition is not available for update.", "udf.not_found");
        }

        await WriteAuditAsync(
            "UdfDefinition",
            "platform.udf_definition.update",
            id.ToString(System.Globalization.CultureInfo.InvariantCulture),
            request,
            cancellationToken);

        return await GetUdfDefinitionAsync(id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<UdfValueDto>> ListUdfValuesAsync(
        string entityType,
        long entityId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                v.Id,
                v.DefinitionId,
                d.EntityType,
                v.EntityId,
                v.ValueText,
                v.ValueNumber,
                v.ValueDate,
                v.ValueBoolean,
                v.CreatedOn,
                v.ModifiedOn
            FROM platform.UdfValues v
            JOIN platform.UdfDefinitions d ON d.Id = v.DefinitionId
            WHERE d.EntityType = @EntityType
              AND v.EntityId = @EntityId
            ORDER BY d.FieldKey;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<UdfValueDto>(new CommandDefinition(
            sql,
            new { EntityType = entityType, EntityId = entityId },
            cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<UdfValueDto> UpsertUdfValueAsync(
        string entityType,
        long entityId,
        UdfValueUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        if (entityId <= 0)
        {
            throw new ValidationFailureException([
                new ApiError("validation.out_of_range", nameof(entityId), "Entity ID must be greater than zero.")
            ]);
        }

        var definition = await GetUdfDefinitionAsync(request.DefinitionId, cancellationToken);
        if (!string.Equals(definition.EntityType, entityType, StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationFailureException([
                new ApiError("validation.lookup", nameof(request.DefinitionId), "UDF definition does not belong to the requested entity type.")
            ]);
        }

        ValidateUdfValue(definition, request);
        var current = currentUserContextAccessor.GetCurrent();
        const string sql = """
            DECLARE @ValueId BIGINT;
            SELECT @ValueId = Id
            FROM platform.UdfValues
            WHERE DefinitionId = @DefinitionId
              AND EntityId = @EntityId;

            IF @ValueId IS NULL
            BEGIN
                INSERT INTO platform.UdfValues
                    (DefinitionId, EntityId, ValueText, ValueNumber, ValueDate, ValueBoolean, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
                VALUES
                    (@DefinitionId, @EntityId, @ValueText, @ValueNumber, @ValueDate, @ValueBoolean, SYSUTCDATETIME(), @ActorUserId, SYSUTCDATETIME(), @ActorUserId);
                SET @ValueId = CAST(SCOPE_IDENTITY() AS BIGINT);
            END
            ELSE
            BEGIN
                UPDATE platform.UdfValues
                SET ValueText = @ValueText,
                    ValueNumber = @ValueNumber,
                    ValueDate = @ValueDate,
                    ValueBoolean = @ValueBoolean,
                    ModifiedOn = SYSUTCDATETIME(),
                    ModifiedByUserId = @ActorUserId
                WHERE Id = @ValueId;
            END;

            SELECT @ValueId;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var valueId = await connection.ExecuteScalarAsync<long>(new CommandDefinition(
            sql,
            new
            {
                request.DefinitionId,
                EntityId = entityId,
                request.ValueText,
                request.ValueNumber,
                request.ValueDate,
                request.ValueBoolean,
                ActorUserId = current.UserId
            },
            cancellationToken: cancellationToken));

        await WriteAuditAsync(
            "UdfValue",
            "platform.udf_value.upsert",
            valueId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            new { entityType, entityId, request },
            cancellationToken);

        return (await ListUdfValuesAsync(entityType, entityId, cancellationToken))
            .First(value => value.Id == valueId);
    }

    public async Task<PagedResult<AuditTrailItem>> ListAuditTrailAsync(
        AuditTrailFilter filter,
        CancellationToken cancellationToken = default)
    {
        var page = filter.Page <= 0 ? 1 : filter.Page;
        var pageSize = filter.PageSize is <= 0 or > 100 ? 50 : filter.PageSize;
        var offset = (page - 1) * pageSize;
        var where = new List<string>();
        var parameters = new DynamicParameters();
        var scope = dataScopeService.GetCurrentScope();

        if (!scope.HasDeploymentAccess)
        {
            if (scope.ActiveCompanyId.HasValue)
            {
                where.Add("(CompanyId IS NULL OR CompanyId = @ScopeCompanyId)");
                parameters.Add("ScopeCompanyId", scope.ActiveCompanyId.Value);
            }

            if (scope.ActiveBranchId.HasValue)
            {
                where.Add("(BranchId IS NULL OR BranchId = @ScopeBranchId)");
                parameters.Add("ScopeBranchId", scope.ActiveBranchId.Value);
            }
        }
        else
        {
            if (filter.CompanyId.HasValue)
            {
                where.Add("CompanyId = @CompanyId");
                parameters.Add("CompanyId", filter.CompanyId.Value);
            }

            if (filter.BranchId.HasValue)
            {
                where.Add("BranchId = @BranchId");
                parameters.Add("BranchId", filter.BranchId.Value);
            }
        }

        if (!string.IsNullOrWhiteSpace(filter.Module))
        {
            where.Add("Module = @Module");
            parameters.Add("Module", filter.Module.Trim());
        }

        if (!string.IsNullOrWhiteSpace(filter.EntityType))
        {
            where.Add("EntityType = @EntityType");
            parameters.Add("EntityType", filter.EntityType.Trim());
        }

        if (!string.IsNullOrWhiteSpace(filter.ActionCode))
        {
            where.Add("ActionCode = @ActionCode");
            parameters.Add("ActionCode", filter.ActionCode.Trim());
        }

        if (filter.DateFrom.HasValue)
        {
            where.Add("CreatedOn >= @DateFrom");
            parameters.Add("DateFrom", filter.DateFrom.Value);
        }

        if (filter.DateTo.HasValue)
        {
            where.Add("CreatedOn <= @DateTo");
            parameters.Add("DateTo", filter.DateTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            where.Add("(Module LIKE @Search OR EntityType LIKE @Search OR ActionCode LIKE @Search OR EntityId LIKE @Search OR CorrelationId LIKE @Search)");
            parameters.Add("Search", $"%{filter.Search.Trim()}%");
        }

        parameters.Add("Offset", offset);
        parameters.Add("PageSize", pageSize);

        var whereClause = where.Count == 0 ? string.Empty : $"WHERE {string.Join(" AND ", where)}";
        var countSql = $"SELECT COUNT(1) FROM platform.AuditLogs {whereClause};";
        var rowsSql = $"""
            SELECT
                Id,
                CompanyId,
                BranchId,
                CreatedOn,
                CreatedByUserId,
                Module,
                EntityType,
                ActionCode,
                EntityId,
                ReasonCode,
                CorrelationId,
                ClientType,
                BeforeSnapshot,
                AfterSnapshot
            FROM platform.AuditLogs
            {whereClause}
            ORDER BY CreatedOn DESC, Id DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var totalCount = await connection.ExecuteScalarAsync<int>(new CommandDefinition(countSql, parameters, cancellationToken: cancellationToken));
        var rows = await connection.QueryAsync<AuditTrailItem>(new CommandDefinition(rowsSql, parameters, cancellationToken: cancellationToken));
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<AuditTrailItem>(rows.ToArray(), page, pageSize, totalCount, totalPages);
    }

    private static IReadOnlyCollection<string> SplitCsv(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Array.Empty<string>();
        }

        return value
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static IReadOnlyCollection<string> ParseJsonStringArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return Array.Empty<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<string[]>(json) ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return Array.Empty<string>();
        }
    }

    private static long ParsePrefixedId(string id, string prefix)
    {
        if (string.IsNullOrWhiteSpace(id) ||
            !id.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) ||
            !long.TryParse(id[prefix.Length..], System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var parsed) ||
            parsed <= 0)
        {
            throw new ValidationFailureException([
                new ApiError("validation.invalid_identifier", nameof(id), $"Identifier must use the '{prefix}123' format.")
            ]);
        }

        return parsed;
    }

    private static string ParseRoleCode(string id)
    {
        const string prefix = "role-";
        if (string.IsNullOrWhiteSpace(id) || !id.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationFailureException([
                new ApiError("validation.invalid_identifier", nameof(id), "Role identifier must use the role-code format.")
            ]);
        }

        var roleCode = id[prefix.Length..].Trim();
        if (string.IsNullOrWhiteSpace(roleCode))
        {
            throw new ValidationFailureException([
                new ApiError("validation.required", nameof(id), "Role code is required.")
            ]);
        }

        return roleCode;
    }

    private static void ValidateUserAccessPolicy(UserAccessPolicyUpdateRequest request)
    {
        var errors = new List<ApiError>();
        AddRequired(errors, request.DisplayName, nameof(request.DisplayName));
        AddMaxLength(errors, request.DisplayName, nameof(request.DisplayName), 160);
        AddMaxLength(errors, request.Email, nameof(request.Email), 256);
        AddRequired(errors, request.LanguageCode, nameof(request.LanguageCode));
        AddMaxLength(errors, request.LanguageCode, nameof(request.LanguageCode), 16);
        AddRequired(errors, request.Status, nameof(request.Status));
        AddRequired(errors, request.LoginPolicy, nameof(request.LoginPolicy));
        AddRequired(errors, request.DeviceBinding, nameof(request.DeviceBinding));

        foreach (var assignment in request.Roles)
        {
            AddRequired(errors, assignment.RoleCode, nameof(assignment.RoleCode));
            AddMaxLength(errors, assignment.RoleCode, nameof(assignment.RoleCode), 64);
        }

        ThrowIfValidationErrors(errors);
    }

    private static void ValidateRole(RoleUpsertRequest request)
    {
        var errors = new List<ApiError>();
        AddRequired(errors, request.RoleCode, nameof(request.RoleCode));
        AddMaxLength(errors, request.RoleCode, nameof(request.RoleCode), 64);
        AddRequired(errors, request.Label, nameof(request.Label));
        AddMaxLength(errors, request.Label, nameof(request.Label), 160);
        AddRequired(errors, request.Audience, nameof(request.Audience));
        AddRequired(errors, request.ScopeMode, nameof(request.ScopeMode));
        AddRequired(errors, request.Status, nameof(request.Status));

        foreach (var permission in request.Permissions)
        {
            AddRequired(errors, permission.PermissionCode, nameof(permission.PermissionCode));
            AddMaxLength(errors, permission.PermissionCode, nameof(permission.PermissionCode), 128);
        }

        ThrowIfValidationErrors(errors);
    }

    private static void ValidateWorkflowRule(WorkflowRuleUpsertRequest request)
    {
        var errors = new List<ApiError>();
        AddRequired(errors, request.WorkflowCode, nameof(request.WorkflowCode));
        AddMaxLength(errors, request.WorkflowCode, nameof(request.WorkflowCode), 64);
        AddRequired(errors, request.DocumentType, nameof(request.DocumentType));
        AddRequired(errors, request.SeriesPattern, nameof(request.SeriesPattern));
        AddRequired(errors, request.ResetPolicy, nameof(request.ResetPolicy));
        AddRequired(errors, request.WorkflowOwner, nameof(request.WorkflowOwner));
        AddRequired(errors, request.ApprovalChain, nameof(request.ApprovalChain));
        AddRequired(errors, request.Status, nameof(request.Status));
        if (request.CurrentNumber < 0)
        {
            errors.Add(new ApiError("validation.out_of_range", nameof(request.CurrentNumber), "Current number must be zero or greater."));
        }

        ThrowIfValidationErrors(errors);
    }

    private static void ValidateTenantSetting(TenantSettingUpdateRequest request)
    {
        var errors = new List<ApiError>();
        AddRequired(errors, request.Value, nameof(request.Value));
        AddMaxLength(errors, request.Value, nameof(request.Value), 512);
        AddRequired(errors, request.Status, nameof(request.Status));
        AddMaxLength(errors, request.Description, nameof(request.Description), 512);
        ThrowIfValidationErrors(errors);
    }

    private static void ValidateTranslation(TranslationResourceUpsertRequest request)
    {
        var errors = new List<ApiError>();
        AddRequired(errors, request.LanguageCode, nameof(request.LanguageCode));
        AddMaxLength(errors, request.LanguageCode, nameof(request.LanguageCode), 16);
        AddRequired(errors, request.TranslationKey, nameof(request.TranslationKey));
        AddMaxLength(errors, request.TranslationKey, nameof(request.TranslationKey), 160);
        AddRequired(errors, request.TranslationValue, nameof(request.TranslationValue));
        AddMaxLength(errors, request.Module, nameof(request.Module), 64);
        ThrowIfValidationErrors(errors);
    }

    private static void ValidateUdfDefinition(UdfDefinitionUpsertRequest request)
    {
        var errors = new List<ApiError>();
        AddRequired(errors, request.EntityType, nameof(request.EntityType));
        AddMaxLength(errors, request.EntityType, nameof(request.EntityType), 64);
        AddRequired(errors, request.FieldKey, nameof(request.FieldKey));
        AddMaxLength(errors, request.FieldKey, nameof(request.FieldKey), 64);
        AddRequired(errors, request.Label, nameof(request.Label));
        AddMaxLength(errors, request.Label, nameof(request.Label), 128);
        AddRequired(errors, request.DataType, nameof(request.DataType));
        AddRequired(errors, request.ControlType, nameof(request.ControlType));
        AddRequired(errors, request.RoleVisibility, nameof(request.RoleVisibility));
        AddRequired(errors, request.Status, nameof(request.Status));
        AddMaxLength(errors, request.LookupSource, nameof(request.LookupSource), 128);
        AddMaxLength(errors, request.RoleVisibility, nameof(request.RoleVisibility), 512);

        var validDataTypes = new[] { "Text", "Number", "Decimal", "Money", "Integer", "Date", "Boolean", "Lookup" };
        if (!validDataTypes.Contains(request.DataType, StringComparer.OrdinalIgnoreCase))
        {
            errors.Add(new ApiError("validation.lookup", nameof(request.DataType), "Choose a supported UDF data type."));
        }

        var validControlTypes = new[] { "Text", "Number", "Decimal", "Money", "Date", "Checkbox", "Lookup", "Select" };
        if (!validControlTypes.Contains(request.ControlType, StringComparer.OrdinalIgnoreCase))
        {
            errors.Add(new ApiError("validation.lookup", nameof(request.ControlType), "Choose a supported UDF control type."));
        }

        if (request.MinNumber.HasValue && request.MaxNumber.HasValue && request.MinNumber.Value > request.MaxNumber.Value)
        {
            errors.Add(new ApiError("validation.out_of_range", nameof(request.MinNumber), "Minimum value must be less than or equal to maximum value."));
        }

        if (request.MaxLength is <= 0)
        {
            errors.Add(new ApiError("validation.out_of_range", nameof(request.MaxLength), "Maximum text length must be greater than zero."));
        }

        if (request.DecimalScale is < 0 or > 6)
        {
            errors.Add(new ApiError("validation.out_of_range", nameof(request.DecimalScale), "Decimal scale must be between 0 and 6."));
        }

        ThrowIfValidationErrors(errors);
    }

    private static void ValidateUdfValue(UdfDefinitionDto definition, UdfValueUpsertRequest request)
    {
        var errors = new List<ApiError>();
        switch (definition.DataType)
        {
            case "Number":
            case "Decimal":
            case "Money":
            case "Integer":
                if (definition.IsRequired && !request.ValueNumber.HasValue)
                {
                    errors.Add(new ApiError("validation.required", nameof(request.ValueNumber), $"{definition.Label} is required."));
                }

                if (request.ValueNumber.HasValue && definition.MinNumber.HasValue && request.ValueNumber.Value < definition.MinNumber.Value)
                {
                    errors.Add(new ApiError("validation.out_of_range", nameof(request.ValueNumber), $"{definition.Label} is below the allowed minimum."));
                }

                if (request.ValueNumber.HasValue && definition.MaxNumber.HasValue && request.ValueNumber.Value > definition.MaxNumber.Value)
                {
                    errors.Add(new ApiError("validation.out_of_range", nameof(request.ValueNumber), $"{definition.Label} is above the allowed maximum."));
                }

                break;
            case "Date":
                if (definition.IsRequired && !request.ValueDate.HasValue)
                {
                    errors.Add(new ApiError("validation.required", nameof(request.ValueDate), $"{definition.Label} date is required."));
                }

                break;
            case "Boolean":
                if (definition.IsRequired && !request.ValueBoolean.HasValue)
                {
                    errors.Add(new ApiError("validation.required", nameof(request.ValueBoolean), $"{definition.Label} is required."));
                }

                break;
            default:
                if (definition.IsRequired && string.IsNullOrWhiteSpace(request.ValueText))
                {
                    errors.Add(new ApiError("validation.required", nameof(request.ValueText), $"{definition.Label} is required."));
                }

                if (definition.MaxLength.HasValue && request.ValueText?.Length > definition.MaxLength.Value)
                {
                    errors.Add(new ApiError("validation.max_length", nameof(request.ValueText), $"{definition.Label} exceeds the allowed length."));
                }

                break;
        }

        ThrowIfValidationErrors(errors);
    }

    private static void AddRequired(List<ApiError> errors, string? value, string field)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add(new ApiError("validation.required", field, $"{field} is required."));
        }
    }

    private static void AddMaxLength(List<ApiError> errors, string? value, string field, int maxLength)
    {
        if (value?.Length > maxLength)
        {
            errors.Add(new ApiError("validation.max_length", field, $"{field} must be {maxLength} characters or less."));
        }
    }

    private static void ThrowIfValidationErrors(IReadOnlyCollection<ApiError> errors)
    {
        if (errors.Count > 0)
        {
            throw new ValidationFailureException(errors);
        }
    }

    private async Task ReplaceRolePermissionsAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        long roleId,
        IReadOnlyCollection<RolePermissionAssignmentRequest> permissions,
        long? actorUserId,
        CancellationToken cancellationToken)
    {
        const string deleteSql = "DELETE FROM platform.RolePermissions WHERE RoleId = @RoleId;";
        const string insertSql = """
            INSERT INTO platform.RolePermissions (RoleId, PermissionId, CreatedOn, CreatedByUserId)
            SELECT @RoleId, p.Id, SYSUTCDATETIME(), @ActorUserId
            FROM platform.Permissions p
            WHERE p.PermissionCode = @PermissionCode
              AND NOT EXISTS (
                  SELECT 1
                  FROM platform.RolePermissions existing
                  WHERE existing.RoleId = @RoleId
                    AND existing.PermissionId = p.Id
              );
            """;

        await connection.ExecuteAsync(new CommandDefinition(
            deleteSql,
            new { RoleId = roleId },
            transaction,
            cancellationToken: cancellationToken));

        foreach (var permission in permissions)
        {
            var inserted = await connection.ExecuteAsync(new CommandDefinition(
                insertSql,
                new { RoleId = roleId, permission.PermissionCode, ActorUserId = actorUserId },
                transaction,
                cancellationToken: cancellationToken));

            if (inserted == 0)
            {
                throw new ValidationFailureException([
                    new ApiError("validation.lookup", nameof(permission.PermissionCode), $"Permission '{permission.PermissionCode}' is not available.")
                ]);
            }
        }
    }

    private async Task<RoleMatrixItem> GetRoleByCodeAsync(string roleCode, CancellationToken cancellationToken)
    {
        return (await ListRolesAsync(cancellationToken))
            .FirstOrDefault(role => string.Equals(role.RoleCode, roleCode, StringComparison.OrdinalIgnoreCase))
            ?? throw new ResourceNotFoundException("Role is not available in the current platform catalog.", "roles.not_found");
    }

    private async Task<IReadOnlyCollection<RolePermissionAssignmentRequest>> GetRolePermissionAssignmentsAsync(
        string roleCode,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT p.PermissionCode
            FROM platform.Roles r
            JOIN platform.RolePermissions rp ON rp.RoleId = r.Id
            JOIN platform.Permissions p ON p.Id = rp.PermissionId
            WHERE r.RoleCode = @RoleCode
            ORDER BY p.Module, p.AccessLevel, p.PermissionCode;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<string>(new CommandDefinition(
            sql,
            new { RoleCode = roleCode },
            cancellationToken: cancellationToken));
        var permissions = rows
            .Select(permissionCode => new RolePermissionAssignmentRequest(permissionCode))
            .ToArray();

        if (permissions.Length == 0)
        {
            throw new ResourceNotFoundException("Source role permissions are not available for cloning.", "roles.not_found");
        }

        return permissions;
    }

    private async Task<UdfDefinitionDto> GetUdfDefinitionAsync(long id, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                Id,
                CompanyId,
                EntityType,
                FieldKey,
                Label,
                DataType,
                ControlType,
                LookupSource,
                IsRequired,
                MinNumber,
                MaxNumber,
                MaxLength,
                DecimalScale,
                RoleVisibility,
                Status,
                CreatedOn,
                ModifiedOn
            FROM platform.UdfDefinitions
            WHERE Id = @Id;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<UdfDefinitionDto>(new CommandDefinition(
                sql,
                new { Id = id },
                cancellationToken: cancellationToken))
            ?? throw new ResourceNotFoundException("UDF definition is not available.", "udf.not_found");
    }

    private Task WriteAuditAsync(
        string entityType,
        string actionCode,
        string entityId,
        object? after,
        CancellationToken cancellationToken)
    {
        return auditTrail.WriteAsync(
            new AuditEntryDraft(
                "platform",
                entityType,
                actionCode,
                entityId,
                null,
                after is null ? null : JsonSerializer.Serialize(after, SnapshotSerializerOptions),
                null),
            cancellationToken);
    }

    private sealed record ApprovalDecisionResult(long? WorkItemId, string? ReferenceNo);

    private sealed record ApprovalRow(
        string Id,
        string Module,
        string DocumentType,
        string ReferenceNo,
        string Title,
        string Summary,
        string SubmittedBy,
        DateTimeOffset SubmittedOn,
        DateTimeOffset DueOn,
        string Status,
        string Priority,
        string StepName,
        string AuditActionLabel,
        string? RelatedNotificationId,
        string? ActionPath,
        string TagsJson);

    private sealed record UserRow(
        string Id,
        string UserName,
        string DisplayName,
        string Email,
        string Status,
        string LoginPolicy,
        string LastLogin,
        string DeviceBinding,
        string? RolesCsv,
        string? BranchAccessCsv);

    private sealed record RoleRow(
        string Id,
        string RoleCode,
        string Label,
        string Audience,
        string ScopeMode,
        int ActiveUsers,
        string MobileSurface,
        string Status,
        long RoleId);

    private sealed record RolePermissionRow(long RoleId, string Module, string Access, string DataScope);
}
