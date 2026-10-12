
# Build the .NET 10 application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY server.csproj ./
RUN dotnet restore server.csproj

COPY . .
RUN dotnet publish server.csproj -c Release -o /app/publish /p:UseAppHost=false

# Run the published application
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

CMD ["sh", "-c", "dotnet server.dll --urls http://0.0.0.0:${PORT:-10000}"]
