using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using STS.Mfg.Application.Abstractions.Attachments;
using STS.Mfg.Infrastructure.Configuration;

namespace STS.Mfg.Infrastructure.Platform.Attachments;

public sealed class LocalAttachmentStorage(
    IOptions<StorageOptions> options,
    IHostEnvironment hostEnvironment) : IAttachmentStorage
{
    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken cancellationToken = default)
    {
        var rootPath = ResolveRootPath();
        Directory.CreateDirectory(rootPath);

        var safeFileName = Path.GetFileName(fileName);
        var storageName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}-{safeFileName}";
        var storagePath = Path.Combine(rootPath, storageName);

        await using var output = File.Create(storagePath);
        await content.CopyToAsync(output, cancellationToken);

        return storagePath;
    }

    public Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        Stream stream = File.OpenRead(storagePath);
        return Task.FromResult(stream);
    }

    public Task<bool> ExistsAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        return Task.FromResult(File.Exists(storagePath));
    }

    private string ResolveRootPath()
    {
        var configured = options.Value.AttachmentsRoot;

        return Path.IsPathRooted(configured)
            ? configured
            : Path.Combine(hostEnvironment.ContentRootPath, configured);
    }
}
