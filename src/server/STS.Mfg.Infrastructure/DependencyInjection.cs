using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using STS.Mfg.Application.Abstractions;
using STS.Mfg.Application.Abstractions.Attachments;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Auth;
using STS.Mfg.Application.Abstractions.AI;
using STS.Mfg.Application.Abstractions.Commercial;
using STS.Mfg.Application.Abstractions.Engineering;
using STS.Mfg.Application.Abstractions.Dispatch;
using STS.Mfg.Application.Abstractions.Integration;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Localization;
using STS.Mfg.Application.Abstractions.Measurements;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Abstractions.Organization;
using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Abstractions.Platform;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Procurement;
using STS.Mfg.Application.Abstractions.Quality;
using STS.Mfg.Application.Abstractions.Resources;
using STS.Mfg.Application.Abstractions.SalesPlanning;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Infrastructure.Engineering;
using STS.Mfg.Infrastructure.Commercial;
using STS.Mfg.Infrastructure.Configuration;
using STS.Mfg.Infrastructure.AI;
using STS.Mfg.Infrastructure.Dispatch;
using STS.Mfg.Infrastructure.HealthChecks;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Integration;
using STS.Mfg.Infrastructure.Measurements;
using STS.Mfg.Infrastructure.Organization;
using STS.Mfg.Infrastructure.Persistence.Mappers.Production;
using STS.Mfg.Infrastructure.Platform.Attachments;
using STS.Mfg.Infrastructure.Platform.Audit;
using STS.Mfg.Infrastructure.Platform.Localization;
using STS.Mfg.Infrastructure.Platform.Notifications;
using STS.Mfg.Infrastructure.Platform.Security;
using STS.Mfg.Infrastructure.Platform;
using STS.Mfg.Infrastructure.Persistence;
using STS.Mfg.Infrastructure.Production;
using STS.Mfg.Infrastructure.Procurement;
using STS.Mfg.Infrastructure.Quality;
using STS.Mfg.Infrastructure.Resources;
using STS.Mfg.Infrastructure.SalesPlanning;

namespace STS.Mfg.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureLayer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var securityOptions = new SecurityOptions
        {
            Issuer = configuration["Security:Issuer"] ?? "sts-mfg",
            Audience = configuration["Security:Audience"] ?? "sts-mfg-api",
            RequireHttpsMetadata = bool.TryParse(configuration["Security:RequireHttpsMetadata"], out var requireHttps) ? requireHttps : true,
            SigningKey = configuration["Security:SigningKey"] ?? "dev-only-bootstrap-signing-key-change-me",
            AccessTokenMinutes = int.TryParse(configuration["Security:AccessTokenMinutes"], out var accessTokenMinutes) ? accessTokenMinutes : 60,
            RefreshTokenDays = int.TryParse(configuration["Security:RefreshTokenDays"], out var refreshTokenDays) ? refreshTokenDays : 7
        };

        services.Configure<SecurityOptions>(configuration.GetSection(SecurityOptions.SectionName));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.Configure<BackgroundJobsOptions>(configuration.GetSection(BackgroundJobsOptions.SectionName));
        services.Configure<LocalizationOptions>(configuration.GetSection(LocalizationOptions.SectionName));
        services.Configure<IntegrationOptions>(configuration.GetSection(IntegrationOptions.SectionName));

        services.AddHttpContextAccessor();
        services.AddDbContext<MfgDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("SqlServer");
            var effectiveConnectionString = string.IsNullOrWhiteSpace(connectionString)
                ? "Server=(localdb)\\MSSQLLocalDB;Database=STS_Mfg_Bootstrap;Trusted_Connection=True;TrustServerCertificate=True"
                : connectionString;

            options.UseSqlServer(effectiveConnectionString, sqlOptions => sqlOptions.EnableRetryOnFailure());
        });

        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddScoped<ISqlConnectionFactory, SqlServerConnectionFactory>();
        services.AddScoped<IStoredProcedureExecutor, StoredProcedureExecutor>();
        services.AddScoped<IMachineBoardReadService, MachineBoardReadService>();
        services.AddScoped<MachineBoardRowMapper>();

        services.AddSingleton<IBootstrapIdentityDirectory, BootstrapIdentityDirectory>();
        services.AddSingleton<RefreshTokenStore>();
        services.AddSingleton<JwtTokenFactory>();
        services.AddScoped<ICurrentUserContextAccessor, CurrentUserContextAccessor>();
        services.AddScoped<IDataScopeService, DataScopeService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPlatformRuntimeService, PlatformRuntimeService>();
        services.AddScoped<IOrganizationService, OrganizationService>();
        services.AddScoped<IMeasurementService, MeasurementService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IInventoryPolicyService, InventoryPolicyService>();
        services.AddScoped<InventoryPostingService>();
        services.AddScoped<IDispatchService, DispatchService>();
        services.AddScoped<IIntegrationService, IntegrationService>();
        services.AddScoped<IOutboundMessageService, OutboundMessageService>();
        services.AddScoped<IAiService, AiService>();
        services.AddScoped<IJobCardService, JobCardService>();
        services.AddScoped<IWorkOrderService, WorkOrderService>();
        services.AddScoped<IProductionOutputService, ProductionOutputService>();
        services.AddScoped<IQualityService, QualityService>();
        services.AddScoped<IProcurementService, ProcurementService>();
        services.AddScoped<IResourceService, ResourceService>();
        services.AddScoped<IEngineeringService, EngineeringService>();
        services.AddScoped<ISalesPlanningService, SalesPlanningService>();
        services.AddScoped<ICustomerCommercialDefaultsService, CustomerCommercialDefaultsService>();
        services.AddScoped<ICommercialMasterService, CommercialMasterService>();
        services.AddScoped<ICommercialCalculationService, CommercialCalculationService>();

        services.AddScoped<IAuditTrail, AuditTrail>();
        services.AddSingleton<IAttachmentStorage, LocalAttachmentStorage>();
        services.AddScoped<IAttachmentService, AttachmentService>();
        services.AddSingleton<IBackgroundJobMonitor, InMemoryBackgroundJobMonitor>();
        services.AddScoped<INotificationOutbox, NotificationOutboxService>();
        services.AddScoped<INotificationTemplateLookup, NotificationTemplateLookup>();
        services.AddScoped<ITranslationService, TranslationService>();
        services.AddSingleton<INotificationChannel, InAppNotificationChannel>();
        services.AddSingleton<INotificationChannel, EmailNotificationChannel>();
        services.AddSingleton<INotificationChannel, SmsNotificationChannel>();
        services.AddSingleton<INotificationChannel, WhatsAppNotificationChannel>();
        services.AddHostedService<NotificationOutboxProcessor>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityOptions.SigningKey));

                options.RequireHttpsMetadata = securityOptions.RequireHttpsMetadata;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = securityOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = securityOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = "role"
                };
                options.Events = new JwtBearerEvents
                {
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();
                        await WriteAuthErrorAsync(context.HttpContext, StatusCodes.Status401Unauthorized, "Authentication is required.", "auth.unauthorized");
                    },
                    OnForbidden = async context =>
                    {
                        await WriteAuthErrorAsync(context.HttpContext, StatusCodes.Status403Forbidden, "The current user does not have access to this action.", "security.forbidden");
                    }
                };
            });

        services.AddAuthorizationPolicies();
        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy("Host is running."), new[] { "live" })
            .AddCheck<SqlServerHealthCheck>("sql-server", tags: new[] { "ready" })
            .AddCheck<AttachmentStorageHealthCheck>("attachment-storage", tags: new[] { "ready" })
            .AddCheck<BackgroundJobsHealthCheck>("background-jobs", tags: new[] { "ready" })
            .AddCheck<IntegrationConfigurationHealthCheck>("integration-placeholders", tags: new[] { "ready" });

        return services;
    }

    private static async Task WriteAuthErrorAsync(HttpContext httpContext, int statusCode, string message, string errorCode)
    {
        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var envelope = ApiEnvelope<object>.FailureResult(
            message,
            new[] { new ApiError(errorCode, null, message) },
            httpContext.TraceIdentifier);

        await httpContext.Response.WriteAsync(
            JsonSerializer.Serialize(envelope, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }
}
