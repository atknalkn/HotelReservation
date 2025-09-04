# Hotel Reservation Deployment Script
Write-Host "Starting Hotel Reservation Platform Deployment..." -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker --version
    docker-compose --version
} catch {
    Write-Host "Docker is not installed or not running. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images
Write-Host "Removing old images..." -ForegroundColor Yellow
docker-compose down --rmi all

# Build and start services
Write-Host "Building and starting services..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "Checking service health..." -ForegroundColor Yellow

# Check PostgreSQL
try {
    $postgresHealth = docker exec hotel_postgres pg_isready -U postgres
    Write-Host "PostgreSQL: $postgresHealth" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL is not ready" -ForegroundColor Red
}

# Check Backend API
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "Backend API: $backendHealth" -ForegroundColor Green
} catch {
    Write-Host "Backend API is not ready" -ForegroundColor Red
}

# Check Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "Frontend: Running" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend is not ready" -ForegroundColor Red
}

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "API Health: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "Swagger UI: http://localhost:5000/swagger" -ForegroundColor Cyan

Write-Host "To stop services, run: docker-compose down" -ForegroundColor Yellow
Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Yellow
