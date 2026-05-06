using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Api.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected ActionResult<ApiEnvelope<T>> OkEnvelope<T>(T data, string? message = null)
    {
        return Ok(ApiEnvelope<T>.SuccessResult(data, message, HttpContext.TraceIdentifier));
    }

    protected ActionResult<ApiEnvelope<T>> CreatedEnvelope<T>(string actionName, object? routeValues, T data, string? message = null)
    {
        return CreatedAtAction(actionName, routeValues, ApiEnvelope<T>.SuccessResult(data, message, HttpContext.TraceIdentifier));
    }
}
