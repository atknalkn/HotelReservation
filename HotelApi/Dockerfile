# .NET 8 SDK imajı ile build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala
COPY HotelApi.csproj .
RUN dotnet restore

# Kaynak kodunu kopyala
COPY . .

# Publish et
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime imajı
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Railway'nin verdiği PORT değişkenini dinle
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE 8080

ENTRYPOINT ["dotnet", "HotelApi.dll"]