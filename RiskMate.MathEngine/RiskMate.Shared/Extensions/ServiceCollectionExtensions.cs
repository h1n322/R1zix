using System;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;
using RiskMate.Api.Services;

namespace RiskMate.Shared.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddRiskMateSettings(this IServiceCollection services, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            services.Configure<RiskMate.Shared.Settings.RiskMateSettings>(options =>
            {
                configuration.GetSection("RiskMateSettings").Bind(options);

                // Priority: Specific environment variables or direct env overrides over config defaults
                var envPythonUrl = FirstNonEmpty(
                    Environment.GetEnvironmentVariable("RiskMateSettings__PythonApiUrl"),
                    Environment.GetEnvironmentVariable("PYTHON_API_URL"),
                    configuration["RiskMateSettings__PythonApiUrl"],
                    configuration["PYTHON_API_URL"],
                    configuration["PythonApiUrl"],
                    configuration["RiskMateSettings:PythonApiUrl"]
                );

                if (!string.IsNullOrWhiteSpace(envPythonUrl))
                {
                    options.PythonApiUrl = envPythonUrl;
                }

                var envGeminiKey = FirstNonEmpty(
                    Environment.GetEnvironmentVariable("RiskMateSettings__GeminiApiKey"),
                    Environment.GetEnvironmentVariable("GEMINI_API_KEY"),
                    configuration["RiskMateSettings__GeminiApiKey"],
                    configuration["GEMINI_API_KEY"],
                    configuration["GeminiApiKey"],
                    configuration["RiskMateSettings:GeminiApiKey"]
                );

                if (!string.IsNullOrWhiteSpace(envGeminiKey))
                {
                    options.GeminiApiKey = envGeminiKey;
                }

                // If running inside a Docker container, localhost cannot reach sibling containers.
                // If PythonApiUrl is empty or points to localhost/127.0.0.1, safely route to python-ml:8000.
                bool isDocker = string.Equals(Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER"), "true", StringComparison.OrdinalIgnoreCase);
                if (isDocker && (string.IsNullOrWhiteSpace(options.PythonApiUrl) ||
                                 options.PythonApiUrl.Contains("localhost", StringComparison.OrdinalIgnoreCase) ||
                                 options.PythonApiUrl.Contains("127.0.0.1")))
                {
                    options.PythonApiUrl = "http://python-ml:8000";
                }
                else if (string.IsNullOrWhiteSpace(options.PythonApiUrl))
                {
                    options.PythonApiUrl = "http://localhost:8000";
                }
            });
            return services;
        }

        private static string? FirstNonEmpty(params string?[] values)
        {
            foreach (var val in values)
            {
                if (!string.IsNullOrWhiteSpace(val))
                {
                    return val;
                }
            }
            return null;
        }

        public static IServiceCollection AddRiskMateServices(this IServiceCollection services, Microsoft.Extensions.Configuration.IConfiguration? configuration = null)
        {
            if (configuration != null)
            {
                services.AddRiskMateSettings(configuration);
            }

            services.AddHttpClient<YahooFinanceService>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5)) // avoid socket exhaustion
                .AddPolicyHandler(GetCircuitBreakerPolicy())
                .AddPolicyHandler(GetRetryPolicy());

            services.AddHttpClient<AiAnalyticsService>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                .AddPolicyHandler(GetCircuitBreakerPolicy())
                .AddPolicyHandler(GetRetryPolicy());

            services.AddSingleton<RiskMate.MathEngine.Simulators.Interfaces.IMonteCarloSimulator, RiskMate.MathEngine.Simulators.MonteCarloSimulator>();
            services.AddSingleton<RiskMate.MathEngine.Simulators.Interfaces.IHistoricalSimulator, RiskMate.MathEngine.Simulators.HistoricalSimulator>();
            services.AddSingleton<RiskMate.MathEngine.Simulators.Interfaces.IGarchSimulator, RiskMate.MathEngine.Simulators.GarchSimulator>();
            services.AddSingleton<RiskMate.MathEngine.Simulators.Interfaces.IMertonJumpSimulator, RiskMate.MathEngine.Simulators.MertonJumpSimulator>();
            services.AddSingleton<RiskMate.MathEngine.Simulators.Interfaces.IStressTestSimulator, RiskMate.MathEngine.Simulators.StressTestSimulator>();
            return services;
        }

        public static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError() // 5xx, 408, HttpRequestException
                .WaitAndRetryAsync(
                    retryCount: 3, 
                    sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt - 1)), // 1s, 2s, 4s
                    onRetry: (outcome, timespan, retryAttempt, context) =>
                    {
                        Console.WriteLine($"[Polly] Transient error ({outcome.Exception?.Message ?? outcome.Result?.StatusCode.ToString()}). Retrying attempt {retryAttempt} in {timespan.TotalSeconds}s...");
                    });
        }

        public static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .CircuitBreakerAsync(
                    handledEventsAllowedBeforeBreaking: 5,
                    durationOfBreak: TimeSpan.FromSeconds(15),
                    onBreak: (outcome, breakDuration) =>
                    {
                        Console.WriteLine($"[Polly] Circuit breaker OPENED for {breakDuration.TotalSeconds}s due to: {outcome.Exception?.Message ?? outcome.Result?.StatusCode.ToString()}");
                    },
                    onReset: () =>
                    {
                        Console.WriteLine("[Polly] Circuit breaker RESET to Closed state.");
                    },
                    onHalfOpen: () =>
                    {
                        Console.WriteLine("[Polly] Circuit breaker is HALF-OPEN. Probing downstream service...");
                    });
        }
    }
}
