namespace STS.Mfg.Application.Abstractions.Security;

public static class AppPolicies
{
    public const string AuthenticatedUser = "AuthenticatedUser";
    public const string PlatformAdministration = "PlatformAdministration";
    public const string CompanyAdministration = "CompanyAdministration";
    public const string BranchOperations = "BranchOperations";
    public const string WarehouseOperations = "WarehouseOperations";
    public const string AuditRead = "AuditRead";
    public const string DiagnosticsRead = "DiagnosticsRead";
}
