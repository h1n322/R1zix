using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Polly.CircuitBreaker;
using RiskMate.Api.Services;
using RiskMate.Shared.Extensions;
using RiskMate.Shared.Settings;
using Xunit;

namespace RiskMate.Api.IntegrationTests
{
    public class ServiceConfigurationTests
    {
        [Fact]
        public void AddRiskMateSettings_BindsFromStandardSection()
        {
            var configData = new Dictionary<string, string?>
            {
                { "RiskMateSettings:PythonApiUrl", "http://python-ml:8000" },
                { "RiskMateSettings:GeminiApiKey", "test-key-123" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            var services = new ServiceCollection();
            services.AddRiskMateSettings(configuration);

            var sp = services.BuildServiceProvider();
            var options = sp.GetRequiredService<IOptions<RiskMateSettings>>().Value;

            Assert.Equal("http://python-ml:8000", options.PythonApiUrl);
            Assert.Equal("test-key-123", options.GeminiApiKey);
        }

        [Fact]
        public void AddRiskMateSettings_BindsFromEnvironmentVariableFormat()
        {
            var configData = new Dictionary<string, string?>
            {
                { "RiskMateSettings__PythonApiUrl", "http://python-ml:8000" },
                { "RiskMateSettings__GeminiApiKey", "secret-docker-key" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            var services = new ServiceCollection();
            services.AddRiskMateSettings(configuration);

            var sp = services.BuildServiceProvider();
            var options = sp.GetRequiredService<IOptions<RiskMateSettings>>().Value;

            Assert.Equal("http://python-ml:8000", options.PythonApiUrl);
            Assert.Equal("secret-docker-key", options.GeminiApiKey);
        }

        [Fact]
        public void AddRiskMateSettings_BindsFromDirectFallbackEnvironmentVariables()
        {
            var configData = new Dictionary<string, string?>
            {
                { "PYTHON_API_URL", "http://python-ml:8000" },
                { "GEMINI_API_KEY", "direct-env-key" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            var services = new ServiceCollection();
            services.AddRiskMateSettings(configuration);

            var sp = services.BuildServiceProvider();
            var options = sp.GetRequiredService<IOptions<RiskMateSettings>>().Value;

            Assert.Equal("http://python-ml:8000", options.PythonApiUrl);
            Assert.Equal("direct-env-key", options.GeminiApiKey);
        }

        [Fact]
        public void AddRiskMateServices_WithConfiguration_RegistersSettingsAndServices()
        {
            var configData = new Dictionary<string, string?>
            {
                { "RiskMateSettings:PythonApiUrl", "http://python-ml:8000" },
                { "RiskMateSettings:GeminiApiKey", "api-key" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            var services = new ServiceCollection();
            services.AddDistributedMemoryCache();
            services.AddRiskMateServices(configuration);

            var sp = services.BuildServiceProvider();
            var options = sp.GetRequiredService<IOptions<RiskMateSettings>>().Value;
            var yahooService = sp.GetService<YahooFinanceService>();
            var aiService = sp.GetService<AiAnalyticsService>();

            Assert.Equal("http://python-ml:8000", options.PythonApiUrl);
            Assert.NotNull(yahooService);
            Assert.NotNull(aiService);
        }

        [Fact]
        public void AddRiskMateSettings_EnvironmentVariables_Override_ExistingAppSettingsValues()
        {
            // Simulates appsettings.json already having default localhost:8000 and empty key,
            // while environment variables PYTHON_API_URL and GEMINI_API_KEY are provided.
            var configData = new Dictionary<string, string?>
            {
                { "RiskMateSettings:PythonApiUrl", "http://localhost:8000" },
                { "RiskMateSettings:GeminiApiKey", "" },
                { "PYTHON_API_URL", "http://python-ml:8000" },
                { "GEMINI_API_KEY", "env-provided-gemini-key" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();

            var services = new ServiceCollection();
            services.AddRiskMateSettings(configuration);

            var sp = services.BuildServiceProvider();
            var options = sp.GetRequiredService<IOptions<RiskMateSettings>>().Value;

            Assert.Equal("http://python-ml:8000", options.PythonApiUrl);
            Assert.Equal("env-provided-gemini-key", options.GeminiApiKey);
        }

        [Fact]
        public void AddRiskMateSettings_DockerEnvironment_AutoRewritesLocalhostToPythonMl()
        {
            var prevDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER");
            try
            {
                Environment.SetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER", "true");

                var configData = new Dictionary<string, string?>
                {
                    { "RiskMateSettings:PythonApiUrl", "http://localhost:8000" }
                };

                var configuration = new ConfigurationBuilder()
                    .AddInMemoryCollection(configData)
                    .Build();

                var services = new ServiceCollection();
                services.AddRiskMateSettings(configuration);

                var sp = services.BuildServiceProvider();
                var options = sp.GetRequiredService<IOptions<RiskMateSettings>>().Value;

                Assert.Equal("http://python-ml:8000", options.PythonApiUrl);
            }
            finally
            {
                Environment.SetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER", prevDocker);
            }
        }

        [Fact]
        public void YahooFinanceService_ResolveBaseUrl_ResolvesCorrectly()
        {
            var prevDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER");
            try
            {
                // In non-docker
                Environment.SetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER", null);
                Assert.Equal("http://localhost:8000", YahooFinanceService.ResolveBaseUrl(null));
                Assert.Equal("http://localhost:8000", YahooFinanceService.ResolveBaseUrl(""));
                Assert.Equal("http://custom:9000", YahooFinanceService.ResolveBaseUrl("http://custom:9000/"));

                // In docker
                Environment.SetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER", "true");
                Assert.Equal("http://python-ml:8000", YahooFinanceService.ResolveBaseUrl(null));
                Assert.Equal("http://python-ml:8000", YahooFinanceService.ResolveBaseUrl("http://localhost:8000"));
                Assert.Equal("http://python-ml:8000", YahooFinanceService.ResolveBaseUrl("http://127.0.0.1:8000/"));
                Assert.Equal("http://custom:9000", YahooFinanceService.ResolveBaseUrl("http://custom:9000"));
            }
            finally
            {
                Environment.SetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER", prevDocker);
            }
        }

        [Fact]
        public async System.Threading.Tasks.Task CircuitBreakerPolicy_TransitionsToOpenAfterHandledFailures()
        {
            var policy = ServiceCollectionExtensions.GetCircuitBreakerPolicy();
            var cbPolicy = policy as AsyncCircuitBreakerPolicy<System.Net.Http.HttpResponseMessage>;
            Assert.NotNull(cbPolicy);
            Assert.Equal(CircuitState.Closed, cbPolicy.CircuitState);

            // Execute 5 transient failures (500 Internal Server Error)
            for (int i = 0; i < 5; i++)
            {
                await Assert.ThrowsAsync<System.Net.Http.HttpRequestException>(async () =>
                {
                    await cbPolicy.ExecuteAsync(async () =>
                    {
                        await System.Threading.Tasks.Task.Yield();
                        throw new System.Net.Http.HttpRequestException("Connection refused");
                    });
                });
            }

            // After 5 failures, circuit breaker must be Open
            Assert.Equal(CircuitState.Open, cbPolicy.CircuitState);

            // While Open, any subsequent call immediately throws BrokenCircuitException
            await Assert.ThrowsAsync<BrokenCircuitException>(async () =>
            {
                await cbPolicy.ExecuteAsync(async () =>
                {
                    await System.Threading.Tasks.Task.Yield();
                    return new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.OK);
                });
            });

            // Resetting puts it back to Closed
            cbPolicy.Reset();
            Assert.Equal(CircuitState.Closed, cbPolicy.CircuitState);
        }

        [Fact]
        public void CircuitBreakerPolicy_IsConfigured()
        {
            var policy = ServiceCollectionExtensions.GetCircuitBreakerPolicy();
            Assert.NotNull(policy);
            var cbPolicy = policy as AsyncCircuitBreakerPolicy<System.Net.Http.HttpResponseMessage>;
            Assert.NotNull(cbPolicy);
            Assert.Equal(CircuitState.Closed, cbPolicy.CircuitState);
        }

        [Fact]
        public void RetryPolicy_IsConfigured()
        {
            var policy = ServiceCollectionExtensions.GetRetryPolicy();
            Assert.NotNull(policy);
        }
    }
}
