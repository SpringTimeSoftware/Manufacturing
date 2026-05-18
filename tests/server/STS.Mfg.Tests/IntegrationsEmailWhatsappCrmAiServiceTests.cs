using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.AI;
using STS.Mfg.Application.Contracts.Integration;
using STS.Mfg.Domain.AI;
using STS.Mfg.Domain.Integration;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Domain.Reporting;
using STS.Mfg.Infrastructure.AI;
using STS.Mfg.Infrastructure.Integration;
using STS.Mfg.Infrastructure.Persistence;
using STS.Mfg.Infrastructure.Platform.Notifications;

namespace STS.Mfg.Tests;

public sealed class IntegrationsEmailWhatsappCrmAiServiceTests
{
    [Fact]
    public async Task ProviderConfig_DoesNotExposeRawCredentialReference()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateIntegrationService(dbContext);

        var provider = await service.CreateProviderAsync(new IntegrationProviderUpsertRequest(
            "SMTP-LIVE",
            "SMTP Live",
            "Email",
            "https://mail.example",
            "Active",
            Channel: "Email",
            VendorType: "SMTP",
            EnvironmentName: "Production",
            CredentialReference: "secret://smtp/live/api-key",
            SenderIdentity: "dispatch@example.test",
            HealthStatus: "Unverified"));

        Assert.NotEqual("secret://smtp/live/api-key", provider.CredentialReference);
        Assert.Contains("...", provider.CredentialReference);
    }

    [Fact]
    public async Task EmailSend_MissingCredentialsCreatesDurableFailedMessage()
    {
        await using var dbContext = CreateDbContext();
        var provider = IntegrationProvider.Create("EMAIL-NO-CRED", "Email Missing Credential", "Email", "https://mail.example", "Active", false, 77);
        provider.Update("EMAIL-NO-CRED", "Email Missing Credential", "Email", "Email", "SMTP", "Production", "https://mail.example", null, "dispatch@example.test", null, null, null, null, null, "Active", "Unverified", null, null, false, 77);
        dbContext.IntegrationProviders.Add(provider);
        await dbContext.SaveChangesAsync();
        dbContext.IntegrationConnections.Add(IntegrationConnection.Create(1, 10, provider.Id, "EMAIL-CONN", "Email connection", "https://mail.example", null, "Active", 77));
        dbContext.IntegrationMessageTemplates.Add(IntegrationMessageTemplate.Create(1, provider.Id, "Email", "SHIPMENT_NOTICE", "Shipment notice", "v1", "Approved", "Shipment {{document}} is ready.", "Active", 77));
        await dbContext.SaveChangesAsync();

        var outbound = CreateOutboundService(dbContext);
        var result = await outbound.QueueMessageAsync(new OutboundMessageRequest(1, 10, "Email", "customer@example.test", "SHIPMENT_NOTICE", new Dictionary<string, string> { ["document"] = "SHIP-001" }, "Shipment", 1001, "Dispatch", "SHIP-001", "Customer"));

        Assert.Equal("Failed", result.DeliveryStatus);
        Assert.Contains("credential reference", result.LastError, StringComparison.OrdinalIgnoreCase);
        var message = await dbContext.IntegrationOutboundMessages.SingleAsync();
        Assert.Equal("Failed", message.Status);
        Assert.Equal("SHIP-001", message.SourceDocumentNo);
        Assert.Single(await dbContext.IntegrationDeliveryEvents.ToListAsync());
    }

    [Fact]
    public async Task WhatsAppSend_RequiresApprovedTemplate()
    {
        await using var dbContext = CreateDbContext();
        var provider = IntegrationProvider.Create("WA", "WhatsApp Provider", "WhatsApp", "https://wa.example", "Active", false, 77);
        provider.Update("WA", "WhatsApp Provider", "WhatsApp", "WhatsApp", "BSP", "Production", "https://wa.example", "secret://wa/live", null, "+919999999999", "sts", null, null, null, "Active", "Unverified", null, null, false, 77);
        dbContext.IntegrationProviders.Add(provider);
        await dbContext.SaveChangesAsync();
        dbContext.IntegrationConnections.Add(IntegrationConnection.Create(1, 10, provider.Id, "WA-CONN", "WhatsApp connection", "https://wa.example", "secret://wa/live", "Active", 77));
        dbContext.IntegrationMessageTemplates.Add(IntegrationMessageTemplate.Create(1, provider.Id, "WhatsApp", "POD_NOTICE", "POD notice", "v1", "Draft", "POD {{document}} is ready.", "Active", 77));
        await dbContext.SaveChangesAsync();

        var outbound = CreateOutboundService(dbContext);
        var result = await outbound.QueueMessageAsync(new OutboundMessageRequest(1, 10, "WhatsApp", "+919876543210", "POD_NOTICE", new Dictionary<string, string> { ["document"] = "POD-001" }, "POD", 9001, "Dispatch", "POD-001", "Customer"));

        Assert.Equal("Failed", result.DeliveryStatus);
        Assert.Contains("approved template", result.LastError, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GeneratedReportOutput_CanBeAttachedToQueuedDelivery()
    {
        await using var dbContext = CreateDbContext();
        var provider = IntegrationProvider.Create("EMAIL-LIVE", "Email Live", "Email", "https://mail.example", "Active", false, 77);
        provider.Update("EMAIL-LIVE", "Email Live", "Email", "Email", "SMTP", "Sandbox", "https://mail.example", "secret://mail/live", "dispatch@example.test", null, null, null, null, null, "Active", "SandboxReady", null, null, false, 77);
        dbContext.IntegrationProviders.Add(provider);
        await dbContext.SaveChangesAsync();
        dbContext.IntegrationConnections.Add(IntegrationConnection.Create(1, 10, provider.Id, "EMAIL-CONN", "Email connection", "https://mail.example", "secret://mail/live", "Active", 77));
        dbContext.IntegrationMessageTemplates.Add(IntegrationMessageTemplate.Create(1, provider.Id, "Email", "COA_NOTICE", "COA notice", "v1", "Approved", "COA {{document}} is issued.", "Active", 77));
        var reportRun = ReportRun.Create(1, 10, 1, "RUN-001", "{}", "PDF", 1, "COA", 101, 77);
        reportRun.MarkCompleted(1, 77);
        dbContext.ReportRuns.Add(reportRun);
        await dbContext.SaveChangesAsync();
        var output = ReportOutput.Create(1, 10, reportRun.Id, "coa.pdf", "PDF", "application/pdf", "reports/coa.pdf", "checksum", 100, "coa", "Completed", 77);
        dbContext.ReportOutputs.Add(output);
        await dbContext.SaveChangesAsync();

        var outbound = CreateOutboundService(dbContext);
        var result = await outbound.QueueMessageAsync(new OutboundMessageRequest(1, 10, "Email", "qa@example.test", "COA_NOTICE", new Dictionary<string, string> { ["document"] = "COA-001" }, "COA", 101, "Quality", "COA-001", "Customer", ReportOutputId: output.Id));

        Assert.Equal("Queued", result.DeliveryStatus);
        Assert.Equal(output.Id, result.ReportOutputId);
    }

    [Fact]
    public async Task WebhookInbound_RejectsUnsignedCallbackWhenCredentialReferenceExists()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateIntegrationService(dbContext);
        await service.CreateProviderAsync(new IntegrationProviderUpsertRequest("CRM-CALLBACK", "CRM Callback", "Webhook", "https://crm.example", "Active", Channel: "Webhook", CredentialReference: "secret://webhook/crm"));

        var result = await service.RecordInboundWebhookAsync("CRM-CALLBACK", new InboundWebhookRequest(1, 10, "CRM.ContactUpdated", "CRM-CONTACT-1", "{\"id\":\"1\"}", null), CancellationToken.None);

        Assert.Equal("Rejected", result.Status);
        Assert.False(result.SignatureVerified);
        Assert.Contains("signature", result.FailureReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CrmSync_RequiresGovernedExternalMappingAndRecordsConflict()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateIntegrationService(dbContext);
        var provider = await service.CreateProviderAsync(new IntegrationProviderUpsertRequest("CRM", "CRM Provider", "CRM", "https://crm.example", "Active", Channel: "CRM", CredentialReference: "secret://crm/live"));
        dbContext.IntegrationConnections.Add(IntegrationConnection.Create(1, 10, provider.Id, "CRM-CONN", "CRM connection", "https://crm.example", "secret://crm/live", "Active", 77));
        await dbContext.SaveChangesAsync();

        var failed = await service.RunCrmSyncAsync(new CrmSyncRequest(1, 10, provider.Id, null, "Customer", "Outbound", new Dictionary<string, string> { ["customerCode"] = "CUST-1" }));
        Assert.Equal("Failed", failed.Status);
        Assert.Single(await dbContext.CrmSyncConflicts.ToListAsync());

        var mapping = await service.UpsertCrmMappingAsync(new CrmObjectMappingUpsertRequest(1, provider.Id, "Customer", 501, "Account", "CRM-501", "Outbound", "None", "Active"));
        var queued = await service.RunCrmSyncAsync(new CrmSyncRequest(1, 10, provider.Id, mapping.Id, "Customer", "Outbound", new Dictionary<string, string> { ["customerCode"] = "CUST-1" }));

        Assert.Equal("Queued", queued.Status);
        Assert.Equal(mapping.Id, queued.CrmObjectMappingId);
    }

    [Fact]
    public async Task AiDraft_RequiresReviewBeforeAppliedUse()
    {
        await using var dbContext = CreateDbContext();
        var provider = AiProvider.Create("AI-REVIEW", "AI Review", "DraftAssistant", "Active", 77);
        dbContext.AiProviders.Add(provider);
        await dbContext.SaveChangesAsync();
        var model = AiModel.Create(provider.Id, "draft-model", "Draft Model", "{}", "Active", 77);
        dbContext.AiModels.Add(model);
        await dbContext.SaveChangesAsync();
        var service = CreateAiService(dbContext);

        var draft = await service.CreateDraftRunAsync(new AiDraftRequest(1, 10, provider.Id, model.Id, null, "QuoteFollowUp", "Draft follow-up for quote approval.", "Quote", 1001));
        Assert.True(draft.RequiresReview);
        Assert.Equal("Drafted", draft.ReviewStatus);

        var reviewed = await service.ReviewRunAsync(draft.Id, new AiReviewRequest("Reviewed", "Approved for operator wording review."));
        Assert.Equal("Reviewed", reviewed.ReviewStatus);
        Assert.Null(reviewed.AppliedTargetType);
    }

    private static IntegrationService CreateIntegrationService(MfgDbContext dbContext) =>
        new(dbContext, new AllowAllDataScopeService(), new TestCurrentUserContextAccessor(), new TestAuditTrail());

    private static OutboundMessageService CreateOutboundService(MfgDbContext dbContext) =>
        new(dbContext, new AllowAllDataScopeService(), new TestCurrentUserContextAccessor(), new TestAuditTrail(), new NotificationTemplateLookup(dbContext));

    private static AiService CreateAiService(MfgDbContext dbContext) =>
        new(dbContext, new AllowAllDataScopeService(), new TestCurrentUserContextAccessor(), new TestAuditTrail());

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private sealed class AllowAllDataScopeService : IDataScopeService
    {
        private static readonly DataScopeContext Scope = new(77, 1, 10, true, RecordVisibilityMode.AllInScope, [1], [10], [], [1], [], []);

        public DataScopeContext GetCurrentScope() => Scope;
        public void EnsureContextAccess(long? companyId, long? branchId) { }
        public void EnsureWarehouseAccess(long? warehouseId) { }
        public void EnsureDepartmentAccess(long? departmentId) { }
        public void EnsureRecordAccess(long? ownerUserId) { }
        public IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null) => new Dictionary<string, object?>();
    }

    private sealed class TestCurrentUserContextAccessor : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent() => GetRequired();
        public CurrentUserContext GetRequired() => new(true, 77, "integration.tester", "Integration Tester", "integration.tester@sts.local", "en-IN", "web", 1, 10, ["PlatformAdmin", "CompanyAdmin"]);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
