using Microsoft.AspNetCore.Builder;
using MathNet.Numerics.Distributions;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/engine/simulate", ([FromBody] SimulationRequest req) =>
    {
        var finalPrices = new ConcurrentBag<double>();

        var dt = req.TimeHorizon / 252.0;

        Parallel.For(0, req.SimulationsCount, i =>
        {
            double currentPrice = req.InitialPrice;
            var normalDist = new Normal(0.0, 1.0, new Random(Guid.NewGuid().GetHashCode()));

            for (int step = 0; step < req.TimeHorizon; step++)
            {
                double z = normalDist.Sample();
                currentPrice *= Math.Exp((req.Drift - 0.5 * Math.Pow(req.Volatility, 2)) * dt + req.Volatility * Math.Sqrt(dt) * z);
            }

            finalPrices.Add(currentPrice);
        });

        var pricesArray = finalPrices.ToArray();
        Array.Sort(pricesArray);

        int percentileIndex = (int)Math.Floor(req.SimulationsCount * 0.05);
        double var95 = req.InitialPrice - pricesArray[percentileIndex];

        return Results.Ok(new
        {
            SimulationsRun = req.SimulationsCount,
            FinalExpectedPrice = pricesArray.Average(),
            VaR_95 = var95 > 0 ? var95 : 0,
        });
    })
    .WithName("RunMonteCarlo");

app.Run();

public record SimulationRequest(
    string Ticker,
    double InitialPrice,
    double Volatility,
    double Drift,
    int TimeHorizon,
    int SimulationsCount
);