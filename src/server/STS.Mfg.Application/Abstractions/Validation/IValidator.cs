using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Abstractions.Validation;

public interface IValidator
{
    Task<IReadOnlyCollection<ApiError>> ValidateAsync(object instance, CancellationToken cancellationToken = default);
}

public interface IValidator<in T> : IValidator
{
    Task<IReadOnlyCollection<ApiError>> ValidateAsync(T instance, CancellationToken cancellationToken = default);
}

public abstract class Validator<T> : IValidator<T>
{
    public abstract Task<IReadOnlyCollection<ApiError>> ValidateAsync(T instance, CancellationToken cancellationToken = default);

    public async Task<IReadOnlyCollection<ApiError>> ValidateAsync(object instance, CancellationToken cancellationToken = default)
    {
        if (instance is not T typedInstance)
        {
            return Array.Empty<ApiError>();
        }

        return await ValidateAsync(typedInstance, cancellationToken);
    }
}
