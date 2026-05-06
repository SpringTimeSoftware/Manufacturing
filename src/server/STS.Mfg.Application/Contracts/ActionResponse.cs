namespace STS.Mfg.Application.Contracts;

public sealed record ActionResponse(
    string Id,
    string Status,
    string ReferenceNo,
    IReadOnlyCollection<string> Warnings);
