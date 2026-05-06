namespace STS.Mfg.Application.Abstractions.Security;

public interface ICurrentUserContextAccessor
{
    CurrentUserContext GetCurrent();

    CurrentUserContext GetRequired();
}
