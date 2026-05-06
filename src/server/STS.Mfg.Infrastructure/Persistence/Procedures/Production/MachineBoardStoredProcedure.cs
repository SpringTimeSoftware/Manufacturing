using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Infrastructure.Persistence.Procedures.Production;

public static class MachineBoardStoredProcedure
{
    public const string Name = "production.sp_Machine_Board";

    public static StoredProcedureRequest BuildRequest(
        MachineBoardQuery query,
        IReadOnlyDictionary<string, object?> scope)
    {
        var parameters = new Dictionary<string, object?>(scope)
        {
            ["DateFrom"] = query.DateFrom,
            ["DateTo"] = query.DateTo,
            ["WorkCenterId"] = query.WorkCenterId,
            ["MachineId"] = query.MachineId,
            ["MachineStatus"] = query.MachineStatus,
            ["ItemId"] = query.ItemId,
            ["WorkOrderId"] = query.WorkOrderId,
            ["JobCardId"] = query.JobCardId
        };

        return new StoredProcedureRequest(Name, parameters);
    }
}
