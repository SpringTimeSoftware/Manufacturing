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
    public void NonConformanceDispositionRelease_ShouldPersistRcaCapaAndAuditState()
    {
        var ncr = NonConformance.Create(
            1,
            10,
            "NCR-2026-0018",
            "Inspection",
            7202,
            null,
            null,
            "Hold",
            "Open",
            "Functional",
            "Hold affected serial",
            "Pending RCA",
            null,
            null,
            null,
            "Initial leak-test failure.",
            1003);

        ncr.ReleaseDisposition(
            "Rework",
            "Keep serial on quality hold until retest.",
            "Gasket seating issue.",
            "Re-seat gasket and rerun leak test.",
            "Update gasket fixture checklist.",
            "Disposition approved by quality.",
            1004);

        Assert.Equal("DispositionReleased", ncr.Status);
        Assert.Equal("Rework", ncr.Disposition);
        Assert.Equal("Gasket seating issue.", ncr.RootCause);
        Assert.Equal("Re-seat gasket and rerun leak test.", ncr.CorrectiveAction);
        Assert.Equal("Update gasket fixture checklist.", ncr.PreventiveAction);
        Assert.NotNull(ncr.DispositionReleasedOn);
        Assert.Equal(1004, ncr.DispositionReleasedByUserId);
    }

    [Fact]
    public void CoaCertificate_ShouldSnapshotInspectionEvidenceAndIssueState()
    {
        var certificate = CoaCertificate.Create(
            1,
            10,
            "COA-2026-0001",
            7202,
            "ProductionReceipt",
            3301,
            4401,
            null,
            "COA-FINAL-STD",
            1,
            "quality/coa/company-1/branch-10/COA-2026-0001-v1.json",
            "Generated",
            null,
            1003);
        var line = CoaCertificateLine.Create(
            0,
            10,
            "LEAK_TEST",
            "No pressure drop",
            "Pass",
            "Pass",
            "Accepted final test.",
            1003);

        certificate.MarkIssued(1004);

        Assert.Equal("COA-2026-0001", certificate.CoaNo);
        Assert.Equal(7202, certificate.InspectionRecordId);
        Assert.Equal("ProductionReceipt", certificate.SourceDocumentType);
        Assert.Equal(1, certificate.VersionNo);
        Assert.Equal("Issued", certificate.Status);
        Assert.NotNull(certificate.IssuedOn);
        Assert.Equal(1004, certificate.IssuedByUserId);
        Assert.Equal("LEAK_TEST", line.ParameterCode);
        Assert.Equal("No pressure drop", line.ExpectedValue);
        Assert.Equal("Pass", line.ActualValue);
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
