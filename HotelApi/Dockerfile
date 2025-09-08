# .NET 8 SDK imajı ile build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala ve restore et
COPY ["HotelApi/HotelApi.csproj", "HotelApi/"]
RUN dotnet restore "HotelApi/HotelApi.csproj"

# Tüm kaynak kodunu kopyala ve publish et
COPY . .
WORKDIR "/src/HotelApi"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime imajı
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HotelApi.dll"]