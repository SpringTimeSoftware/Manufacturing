namespace STS.Mfg.Infrastructure.Configuration;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string AttachmentsRoot { get; init; } = "App_Data\\attachments";
}
