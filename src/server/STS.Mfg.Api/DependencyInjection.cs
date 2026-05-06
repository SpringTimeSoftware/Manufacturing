using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Api.Filters;

namespace STS.Mfg.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApiLayer(this IServiceCollection services)
    {
        services.AddControllers()
            .AddApplicationPart(typeof(DependencyInjection).Assembly);
        services.AddScoped<RequestValidationFilter>();
        services.Configure<ApiBehaviorOptions>(options => options.SuppressModelStateInvalidFilter = true);
        services.Configure<MvcOptions>(options => options.Filters.AddService<RequestValidationFilter>());

        return services;
    }
}
