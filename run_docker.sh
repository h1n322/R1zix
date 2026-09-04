docker run --rm -v $(pwd):/app -w /app mcr.microsoft.com/dotnet/sdk:10.0 dotnet test RiskMate.MathEngine/RiskMate.MathEngine.Tests/RiskMate.MathEngine.Tests.csproj --configuration Release
