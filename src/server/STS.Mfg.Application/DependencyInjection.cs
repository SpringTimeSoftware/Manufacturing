using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using STS.Mfg.Application.Abstractions.Validation;

namespace STS.Mfg.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        RegisterValidators(services);

        return services;
    }

    private static void RegisterValidators(IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var validatorInterface = typeof(IValidator<>);

        foreach (var type in assembly.GetTypes().Where(type => type is { IsAbstract: false, IsInterface: false }))
        {
            var validatorContracts = type
                .GetInterfaces()
                .Where(contract => contract.IsGenericType && contract.GetGenericTypeDefinition() == validatorInterface)
                .ToArray();

            if (validatorContracts.Length == 0)
            {
                continue;
            }

            foreach (var contract in validatorContracts)
            {
                services.AddScoped(contract, type);
            }

            services.AddScoped(typeof(IValidator), type);
        }
    }
}
