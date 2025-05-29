FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["services/alert-service/AlertService.csproj", "services/alert-service/"]
RUN dotnet restore "services/alert-service/AlertService.csproj"
COPY . .
WORKDIR "/src/services/alert-service"
RUN dotnet build "AlertService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AlertService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AlertService.dll"]
