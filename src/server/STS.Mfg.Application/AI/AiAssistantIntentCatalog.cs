using STS.Mfg.Application.Contracts.AI;

namespace STS.Mfg.Application.AI;

public static class AiAssistantIntentCatalog
{
    private static readonly AiAssistantIntentDefinitionDto[] Definitions =
    [
        new(
            "order-risk-snapshot",
            "Order risk snapshot",
            "Return deterministic order delivery risk using the approved dashboard stored procedure.",
            "StoredProcedure",
            "reporting.sp_Order_RiskSnapshot",
            ["CompanyId", "BranchId", "DateFrom", "DateTo", "CustomerId", "Status"]),
        new(
            "stage-wise-dashboard",
            "Stage-wise dashboard",
            "Return cross-functional stage blockers using the approved dashboard stored procedure.",
            "StoredProcedure",
            "reporting.sp_StageWise_Dashboard",
            ["CompanyId", "BranchId", "AsOfDate", "CustomerId"]),
        new(
            "machine-board",
            "Machine board",
            "Return machine lane visibility using the approved machine board procedure.",
            "StoredProcedure",
            "production.sp_Machine_Board",
            ["CompanyId", "BranchId", "MachineId", "WorkCenterId", "AsOfDate"]),
        new(
            "lot-genealogy",
            "Lot genealogy",
            "Return forward/backward traceability through the approved genealogy procedure.",
            "StoredProcedure",
            "inventory.sp_Traceability_LotGenealogy",
            ["CompanyId", "BranchId", "LotId", "SerialId", "ItemId"])
    ];

    public static IReadOnlyCollection<AiAssistantIntentDefinitionDto> ListDefinitions() => Definitions;

    public static AiAssistantIntentDefinitionDto? Find(string intentCode) =>
        Definitions.FirstOrDefault(definition => definition.IntentCode.Equals(intentCode.Trim(), StringComparison.OrdinalIgnoreCase));

    public static IReadOnlyCollection<string> FindUnsupportedParameters(AiAssistantIntentDefinitionDto definition, IReadOnlyDictionary<string, string> parameters)
    {
        var allowed = definition.AllowedParameters.ToHashSet(StringComparer.OrdinalIgnoreCase);
        return parameters.Keys
            .Where(parameter => !allowed.Contains(parameter))
            .OrderBy(parameter => parameter, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public static AiAssistantQueryPlanDto BuildPlan(AiAssistantIntentDefinitionDto definition, long? companyId, long? branchId, IReadOnlyDictionary<string, string> parameters)
    {
        var normalized = new Dictionary<string, string>(parameters, StringComparer.OrdinalIgnoreCase);
        if (companyId.HasValue)
        {
            normalized["CompanyId"] = companyId.Value.ToString(System.Globalization.CultureInfo.InvariantCulture);
        }

        if (branchId.HasValue)
        {
            normalized["BranchId"] = branchId.Value.ToString(System.Globalization.CultureInfo.InvariantCulture);
        }

        var planParameters = definition.AllowedParameters
            .Where(parameter => normalized.ContainsKey(parameter))
            .Select(parameter => new AiAssistantParameterDto(parameter, normalized[parameter], parameter is "CompanyId" or "BranchId" ? "Scope" : "User"))
            .ToArray();

        return new AiAssistantQueryPlanDto(
            definition.IntentCode,
            definition.DisplayName,
            definition.ExecutionKind,
            definition.CommandName,
            planParameters,
            UsesArbitrarySql: false,
            RequiresReview: false,
            SafetyNote: "Assistant execution is limited to approved stored procedures with named parameters; arbitrary SQL is blocked.");
    }
}
