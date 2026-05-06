using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Infrastructure.Persistence.Mappers.Production;

public sealed class MachineBoardRowMapper
{
    public MachineBoardItem Map(MachineBoardRow row)
    {
        return new MachineBoardItem(
            row.MachineId,
            row.MachineCode,
            row.MachineName,
            row.WorkCenterId,
            row.CurrentStatus,
            row.ActiveJobCardId,
            row.ActiveJobCardNo,
            row.ActiveWorkOrderNo,
            row.ItemCode,
            row.PlannedStartOn,
            row.PlannedEndOn,
            row.RiskStatus,
            row.QueuedJobCardsJson ?? "[]");
    }
}

public sealed record MachineBoardRow(
    long MachineId,
    string MachineCode,
    string MachineName,
    long? WorkCenterId,
    string CurrentStatus,
    long? ActiveJobCardId,
    string? ActiveJobCardNo,
    string? ActiveWorkOrderNo,
    string? ItemCode,
    DateTimeOffset? PlannedStartOn,
    DateTimeOffset? PlannedEndOn,
    string? RiskStatus,
    string? QueuedJobCardsJson);
