using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using STS.Mfg.Api;
using STS.Mfg.Api.Middleware;
using STS.Mfg.Application;
using STS.Mfg.Host;
using STS.Mfg.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

builder.Services.AddApplicationLayer();
builder.Services.AddInfrastructureLayer(builder.Configuration);
builder.Services.AddApiLayer();
builder.Services.AddApiRateLimiting();
builder.Services.AddRouting(options => options.LowercaseUrls = true);

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ApiExceptionHandlingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/api/health/live", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("live"),
    ResponseWriter = WriteHealthResponseAsync
});
app.MapHealthChecks("/api/health/ready", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("ready"),
    ResponseWriter = WriteHealthResponseAsync
});

var fallbackFile = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "index.html");
if (File.Exists(fallbackFile))
{
    app.MapFallbackToFile("index.html");
}

app.Run();

static Task WriteHealthResponseAsync(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";

    var payload = new
    {
        status = report.Status.ToString(),
        entries = report.Entries.ToDictionary(
            entry => entry.Key,
            entry => new
            {
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                durationMs = entry.Value.Duration.TotalMilliseconds
            })
    };

    return context.Response.WriteAsync(JsonSerializer.Serialize(payload, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
}
