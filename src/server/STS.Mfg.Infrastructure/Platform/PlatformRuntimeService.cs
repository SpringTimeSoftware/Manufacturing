using System.Text.Json;
using Dapper;
using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Abstractions.Platform;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Infrastructure.Platform;

public sealed class PlatformRuntimeService(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserContextAccessor currentUserContextAccessor) : IPlatformRuntimeService
{
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
            ORDER BY CreatedOn DESC, Id DESC;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<NotificationItem>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToArray();
    }

    public async Task<ActionResponse> MarkNotificationReadAsync(string id, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE platform.Notifications
            SET IsRead = 1,
                ReadOn = COALESCE(ReadOn, SYSUTCDATETIME()),
                ModifiedOn = SYSUTCDATETIME()
            WHERE NotificationKey = @Id OR CONVERT(NVARCHAR(32), Id) = @Id;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
        return new ActionResponse(id, affected > 0 ? "Read" : "NotFound", id, Array.Empty<string>());
    }

    public async Task<ActionResponse> MarkAllNotificationsReadAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE platform.Notifications
            SET IsRead = 1,
                ReadOn = COALESCE(ReadOn, SYSUTCDATETIME()),
                ModifiedOn = SYSUTCDATETIME()
            WHERE Title IS NOT NULL AND IsRead = 0;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var affected = await connection.ExecuteAsync(new CommandDefinition(sql, cancellationToken: cancellationToken));
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
            ORDER BY
                CASE WHEN Status = N'Escalated' THEN 0 WHEN Status = N'Pending' THEN 1 ELSE 2 END,
                DueOn,
                Id;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<ApprovalRow>(new CommandDefinition(sql, cancellationToken: cancellationToken));
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
            WHERE WorkItemKey = @Id;

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

            SELECT COALESCE(@referenceNo, @Id);
            """;

        var current = currentUserContextAccessor.GetCurrent();
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var referenceNo = await connection.ExecuteScalarAsync<string>(new CommandDefinition(
            sql,
            new
            {
                Id = id,
                request.Decision,
                request.Remarks,
                NextStatus = nextStatus,
                current.UserId
            },
            cancellationToken: cancellationToken));

        return new ActionResponse(id, request.Decision, referenceNo ?? id, Array.Empty<string>());
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
            GROUP BY u.Id, u.UserName, u.DisplayName, u.Email, u.Status, u.LoginPolicy, u.LastLoginText, u.DeviceBinding
            ORDER BY u.DisplayName;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<UserRow>(new CommandDefinition(sql, cancellationToken: cancellationToken));
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
