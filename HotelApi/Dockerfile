# Use the official .NET 8 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the official .NET 8 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["HotelApi.csproj", "."]
RUN dotnet restore "HotelApi.csproj"
COPY . .
RUN dotnet build "HotelApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HotelApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HotelApi.dll"]