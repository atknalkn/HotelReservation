# Use the official .NET 8 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the official .NET 8 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file
COPY HotelReservation.sln ./

# Copy the HotelApi project file
COPY HotelApi/HotelApi.csproj HotelApi/

# Restore dependencies
RUN dotnet restore HotelApi/HotelApi.csproj

# Copy the rest of the HotelApi project
COPY HotelApi/ HotelApi/

# Build the project
WORKDIR /src/HotelApi
RUN dotnet build HotelApi.csproj -c Release -o /app/build

# Publish the project
FROM build AS publish
RUN dotnet publish HotelApi.csproj -c Release -o /app/publish /p:UseAppHost=false

# Create the final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables for Railway
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

# Expose the port that Railway will use
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "HotelApi.dll"]
