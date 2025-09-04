# Hotel Reservation Platform - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- PowerShell (Windows) or Bash (Linux/Mac)

### 1. Clone and Navigate
```bash
git clone <your-repo>
cd HotelReservation
```

### 2. Deploy with Docker Compose
```powershell
# Windows PowerShell
.\deploy.ps1

# Or manually
docker-compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **Swagger UI**: http://localhost:5000/swagger

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│   Frontend      │────│   Backend API   │
│   Port: 80      │    │   Next.js       │    │   .NET 8        │
└─────────────────┘    │   Port: 3000    │    │   Port: 5000    │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   Port: 5432    │
                                              └─────────────────┘
```

## 📋 Services

### Frontend (Next.js)
- **Container**: hotel_frontend
- **Port**: 3000
- **Features**: React UI, TailwindCSS, TypeScript

### Backend API (.NET 8)
- **Container**: hotel_backend
- **Port**: 5000
- **Features**: REST API, JWT Auth, Entity Framework

### Database (PostgreSQL)
- **Container**: hotel_postgres
- **Port**: 5432
- **Database**: HotelRezervationDB

### Reverse Proxy (Nginx)
- **Container**: hotel_nginx
- **Port**: 80
- **Features**: Load balancing, SSL termination

## 🛠️ Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild Services
```bash
docker-compose up --build -d
```

### Database Management
```bash
# Connect to PostgreSQL
docker exec -it hotel_postgres psql -U postgres -d HotelRezervationDB

# Run migrations
docker exec hotel_backend dotnet ef database update
```

## 🔧 Configuration

### Environment Variables
- **Backend**: Set in docker-compose.yml
- **Frontend**: Set in docker-compose.yml
- **Database**: Set in docker-compose.yml

### Ports
- **80**: Nginx (Main entry point)
- **3000**: Frontend (Direct access)
- **5000**: Backend API (Direct access)
- **5432**: PostgreSQL (Direct access)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose logs postgres
   # Restart database
   docker-compose restart postgres
   ```

3. **Frontend not loading**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   # Rebuild frontend
   docker-compose up --build frontend
   ```

### Health Checks
```bash
# Check all services
docker-compose ps

# Test API health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000
```

## 📊 Monitoring

### View Resource Usage
```bash
docker stats
```

### Database Backup
```bash
# Create backup
docker exec hotel_postgres pg_dump -U postgres HotelRezervationDB > backup.sql

# Restore backup
docker exec -i hotel_postgres psql -U postgres HotelRezervationDB < backup.sql
```

## 🔒 Security Notes

- Change default passwords in production
- Use environment variables for secrets
- Enable HTTPS in production
- Regular security updates

## 📝 Development

### Local Development
```bash
# Backend only
cd HotelApi
dotnet run

# Frontend only
cd hotelweb
npm run dev
```

### Production Deployment
Use the provided Docker setup for production deployment.

---

**Happy Deploying! 🎉**
