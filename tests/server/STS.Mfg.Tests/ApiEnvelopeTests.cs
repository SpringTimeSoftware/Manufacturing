using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Tests;

public sealed class ApiEnvelopeTests
{
    [Fact]
    public void SuccessResult_ShouldCreateSuccessfulEnvelope()
    {
        var envelope = ApiEnvelope<string>.SuccessResult("ok", "done", "corr-1");

        Assert.True(envelope.Success);
        Assert.Equal("ok", envelope.Data);
        Assert.Equal("done", envelope.Message);
        Assert.Equal("corr-1", envelope.Meta.CorrelationId);
        Assert.Empty(envelope.Errors);
    }
}
