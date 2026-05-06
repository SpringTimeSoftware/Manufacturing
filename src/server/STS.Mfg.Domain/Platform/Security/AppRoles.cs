namespace STS.Mfg.Domain.Platform.Security;

public static class AppRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string PlatformAdmin = "PlatformAdmin";
    public const string CompanyAdmin = "CompanyAdmin";
    public const string SalesCoordinator = "SalesCoordinator";
    public const string PlanningManager = "PlanningManager";
    public const string PurchaseManager = "PurchaseManager";
    public const string StoreKeeper = "StoreKeeper";
    public const string ProductionSupervisor = "ProductionSupervisor";
    public const string MachineOperator = "MachineOperator";
    public const string QCInspector = "QCInspector";
    public const string DispatchManager = "DispatchManager";
    public const string PlantHead = "PlantHead";
    public const string ManagementViewer = "ManagementViewer";

    public static readonly IReadOnlyCollection<string> All = new[]
    {
        SuperAdmin,
        PlatformAdmin,
        CompanyAdmin,
        SalesCoordinator,
        PlanningManager,
        PurchaseManager,
        StoreKeeper,
        ProductionSupervisor,
        MachineOperator,
        QCInspector,
        DispatchManager,
        PlantHead,
        ManagementViewer
    };
}
