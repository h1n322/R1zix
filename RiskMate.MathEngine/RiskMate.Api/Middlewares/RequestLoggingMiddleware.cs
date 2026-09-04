using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Threading.Tasks;

namespace RiskMate.Api.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var sw = Stopwatch.StartNew();
            
            try
            {
                await _next(context);
                sw.Stop();
                
                var statusCode = context.Response?.StatusCode;
                var level = statusCode > 499 ? LogLevel.Error : LogLevel.Information;
                
                _logger.Log(level, "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms", 
                    context.Request?.Method, 
                    context.Request?.Path.Value, 
                    statusCode, 
                    sw.Elapsed.TotalMilliseconds);
            }
            // We do not catch exceptions here since GlobalExceptionMiddleware will handle them.
            // But if it slips through, ensure we stop the watch
            finally
            {
                if (sw.IsRunning) sw.Stop();
            }
        }
    }
}
