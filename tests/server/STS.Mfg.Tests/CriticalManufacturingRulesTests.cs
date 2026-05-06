using STS.Mfg.Application.AI;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Quality;

namespace STS.Mfg.Tests;

public sealed class CriticalManufacturingRulesTests
{
    [Fact]
    public void WorkOrderRelease_ShouldStampReleasedStateWithoutChangingPlanningLinks()
    {
        var workOrder = WorkOrder.Create(
            1,
            10,
            "WO-2026-044",
            8001,
            5001,
            6001,
            7001,
            10,
            21,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
            "Planned",
            "Ready for release",
            1000);

        workOrder.MarkReleased("Material and routing ready.", DateTimeOffset.UtcNow, 1000);

        Assert.Equal("Released", workOrder.Status);
        Assert.NotNull(workOrder.ReleasedOn);
        Assert.Equal(5001, workOrder.ItemId);
        Assert.Equal(6001, workOrder.BomRevisionId);
        Assert.Equal(7001, workOrder.RoutingId);
    }

    [Fact]
    public void JobCardExecution_ShouldTrackStartPauseResumeAndQuantities()
    {
        var jobCard = JobCard.Create(
            1,
            10,
            "JC-90441",
            100,
            200,
            null,
            null,
            null,
            null,
            null,
            10,
            0,
            0,
            0,
            "Assigned",
            1000);

        jobCard.Start(301, 1002, "Started", 1002);
        jobCard.SetStatus("Paused", 1002);
        jobCard.SetStatus("Started", 1002);
        jobCard.LogQuantities(6, 1, 0.5m, 1002);

        Assert.Equal("Started", jobCard.Status);
        Assert.Equal(301, jobCard.AssignedMachineId);
        Assert.Equal(1002, jobCard.AssignedOperatorUserId);
        Assert.Equal(6, jobCard.CompletedGoodQty);
        Assert.Equal(1, jobCard.CompletedRejectQty);
        Assert.Equal(0.5m, jobCard.CompletedScrapQty);
    }

    [Fact]
    public void StockMovement_ShouldPreserveSourceDocumentAndTraceabilityContext()
    {
        var transaction = StockTransaction.Create(
            1,
            10,
            "ISS-2026-0001",
            "IssueToWO",
            DateOnly.FromDateTime(DateTime.Today),
            5001,
            null,
            11,
            21,
            null,
            null,
            31,
            null,
            4,
            4.2m,
            "Issued",
            "WorkOrder",
            100,
            "Issued to job card JC-90441.",
            1001);

        Assert.Equal("IssueToWO", transaction.TransactionType);
        Assert.Equal("WorkOrder", transaction.SourceDocumentType);
        Assert.Equal(100, transaction.SourceDocumentId);
        Assert.Equal(31, transaction.LotId);
        Assert.Equal(4.2m, transaction.CatchWeightQty);
    }

    [Fact]
    public void QualityHoldRelease_ShouldUseCanonicalHoldAndReleaseStates()
    {
        var inspection = InspectionRecord.Create(
            1,
            10,
            "INSP-IP-2026-0014",
            50,
            "InProcess",
            "JobCard",
            200,
            null,
            null,
            "Open",
            "Pending",
            "qc-token-0014",
            null,
            1003);

        inspection.MarkHeld("Leak test evidence missing.", 1003);
        Assert.Equal("Held", inspection.Status);
        Assert.Equal("Hold", inspection.OverallResult);
        Assert.NotNull(inspection.HeldOn);

        inspection.MarkReleased("Evidence attached and reviewed.", 1003);
        Assert.Equal("Released", inspection.Status);
        Assert.Equal("Pass", inspection.OverallResult);
        Assert.NotNull(inspection.ReleasedOn);
    }

    [Fact]
    public void AiAssistantCatalog_ShouldBlockUnsupportedParametersAndArbitrarySql()
    {
        var definition = AiAssistantIntentCatalog.Find("order-risk-snapshot");

        Assert.NotNull(definition);
        Assert.Equal("reporting.sp_Order_RiskSnapshot", definition!.CommandName);

        var unsupported = AiAssistantIntentCatalog.FindUnsupportedParameters(
            definition,
            new Dictionary<string, string> { ["RawSql"] = "DROP TABLE WorkOrders" });

        Assert.Equal(new[] { "RawSql" }, unsupported);

        var plan = AiAssistantIntentCatalog.BuildPlan(definition, 1, 10, new Dictionary<string, string> { ["Status"] = "AtRisk" });

        Assert.False(plan.UsesArbitrarySql);
        Assert.Equal("StoredProcedure", plan.ExecutionKind);
        Assert.Contains(plan.Parameters, parameter => parameter.Name == "CompanyId" && parameter.Source == "Scope");
        Assert.Contains(plan.Parameters, parameter => parameter.Name == "Status" && parameter.Value == "AtRisk");
    }
}
