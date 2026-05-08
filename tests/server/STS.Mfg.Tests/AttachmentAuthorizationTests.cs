using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Domain.Platform.Attachments;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Tests;

public sealed class AttachmentAuthorizationTests
{
    [Fact]
    public void ApplyActiveOrganizationScope_ShouldHideAttachmentsOutsideActiveBranch()
    {
        var records = new[]
        {
            AttachmentRecord.Create(1, 11, "WorkOrder", 101, "in-scope.pdf", "application/pdf", "in-scope.pdf", 100, 21),
            AttachmentRecord.Create(1, 12, "WorkOrder", 102, "other-branch.pdf", "application/pdf", "other-branch.pdf", 100, 21),
            AttachmentRecord.Create(2, 21, "WorkOrder", 103, "other-company.pdf", "application/pdf", "other-company.pdf", 100, 21)
        };

        var visible = records.AsQueryable()
            .ApplyActiveOrganizationScope(CreateScope(RecordVisibilityMode.AllInScope))
            .ToArray();

        var only = Assert.Single(visible);
        Assert.Equal("in-scope.pdf", only.FileName);
    }

    [Fact]
    public void ApplyRecordVisibility_ShouldHideAttachmentsOwnedByOtherUsersInOwnMode()
    {
        var records = new[]
        {
            AttachmentRecord.Create(1, 11, "WorkOrder", 101, "owned.pdf", "application/pdf", "owned.pdf", 100, 21),
            AttachmentRecord.Create(1, 11, "WorkOrder", 102, "other-owner.pdf", "application/pdf", "other-owner.pdf", 100, 99)
        };

        var visible = records.AsQueryable()
            .ApplyRecordVisibility(CreateScope(RecordVisibilityMode.Own))
            .ToArray();

        var only = Assert.Single(visible);
        Assert.Equal("owned.pdf", only.FileName);
    }

    private static DataScopeContext CreateScope(RecordVisibilityMode visibilityMode)
    {
        return new DataScopeContext(
            21,
            1,
            11,
            false,
            visibilityMode,
            new[] { 1L },
            new[] { 11L },
            Array.Empty<long>(),
            Array.Empty<long>(),
            Array.Empty<long>(),
            Array.Empty<string>());
    }
}
