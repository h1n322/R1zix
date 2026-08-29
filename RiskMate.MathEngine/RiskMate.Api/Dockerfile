# Використовуємо офіційний SDK для збірки
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Копіюємо .sln та .csproj файли для відновлення залежностей
COPY RiskMate.MathEngine.sln ./
COPY RiskMate.Api/RiskMate.Api.csproj RiskMate.Api/
COPY RiskMate.MathEngine/RiskMate.MathEngine.csproj RiskMate.MathEngine/
COPY RiskMate.MathEngine.Tests/RiskMate.MathEngine.Tests.csproj RiskMate.MathEngine.Tests/

# Відновлюємо NuGet пакети
RUN dotnet restore RiskMate.MathEngine.sln

# Копіюємо решту коду
COPY . .

# Збираємо додаток
WORKDIR /app/RiskMate.Api
RUN dotnet publish -c Release -o /out

# Використовуємо ASP.NET Runtime для виконання
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Відкриваємо порти
EXPOSE 8080

# Вказуємо точку входу
ENTRYPOINT ["dotnet", "RiskMate.Api.dll"]
