using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using STS.Mfg.Application.Abstractions.Validation;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Exceptions;

namespace STS.Mfg.Api.Filters;

public sealed class RequestValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var errors = new List<ApiError>();

        if (!context.ModelState.IsValid)
        {
            errors.AddRange(
                context.ModelState
                    .Where(entry => entry.Value?.Errors.Count > 0)
                    .SelectMany(entry => entry.Value!.Errors.Select(error =>
                        new ApiError(
                            "validation.invalid",
                            entry.Key,
                            string.IsNullOrWhiteSpace(error.ErrorMessage) ? "The supplied value is invalid." : error.ErrorMessage))));
        }

        var validators = context.HttpContext.RequestServices.GetServices<IValidator>().ToArray();

        foreach (var argument in context.ActionArguments.Values.Where(argument => argument is not null))
        {
            foreach (var validator in validators)
            {
                var validationErrors = await validator.ValidateAsync(argument!, context.HttpContext.RequestAborted);
                errors.AddRange(validationErrors);
            }
        }

        if (errors.Count > 0)
        {
            throw new ValidationFailureException(errors);
        }

        await next();
    }
}
