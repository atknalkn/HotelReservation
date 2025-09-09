# Railway Deployment Guide

## Railway'e Deploy Etme Adımları

### 1. Railway Hesabı ve Proje Oluşturma

1. [Railway.app](https://railway.app) adresine gidin
2. GitHub hesabınızla giriş yapın
3. "New Project" butonuna tıklayın
4. "Deploy from GitHub repo" seçin
5. HotelReservation repository'sini seçin

### 2. Environment Variables Ayarlama

Railway dashboard'da Settings > Variables bölümünde şu environment variable'ları ekleyin:

```
ASPNETCORE_ENVIRONMENT=Production
PORT=8080
```

### 3. Database Connection String

PostgreSQL database için connection string'i ayarlayın:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

Veya Railway'in PostgreSQL servisini kullanıyorsanız, otomatik olarak `DATABASE_URL` environment variable'ı oluşturulur.

### 4. JWT Settings

Güvenlik için JWT ayarlarını environment variable olarak ekleyin:

```
JWT_SECRET_KEY=your-super-secret-key-with-at-least-32-characters-long
JWT_ISSUER=HotelReservationAPI
JWT_AUDIENCE=HotelReservationUsers
JWT_EXPIRATION_IN_MINUTES=60
```

### 5. Deploy

1. Railway otomatik olarak Dockerfile'ı kullanarak build işlemini başlatacak
2. Build tamamlandıktan sonra uygulama otomatik olarak deploy edilecek
3. Railway size bir URL verecek (örn: https://your-app-name.railway.app)

### 6. Test Etme

Deploy edildikten sonra şu endpoint'leri test edin:

- Health Check: `GET https://your-app-name.railway.app/health`
- API Health: `GET https://your-app-name.railway.app/api/health`
- Swagger UI: `https://your-app-name.railway.app/swagger`

### 7. Database Migration

İlk deploy'dan sonra database migration'ları çalıştırmanız gerekebilir. Railway console'da:

```bash
dotnet ef database update
```

### Troubleshooting

#### Build Hataları

- Dockerfile'ın proje kökünde olduğundan emin olun
- .dockerignore dosyasının doğru olduğunu kontrol edin

#### Runtime Hataları

- Environment variable'ların doğru ayarlandığını kontrol edin
- Database connection string'inin doğru olduğunu kontrol edin
- Logs bölümünden hata detaylarını inceleyin

#### Port Hataları

- Railway otomatik olarak PORT environment variable'ını sağlar
- Uygulama 0.0.0.0:PORT adresinde dinlemelidir

### Önemli Notlar

- Frontend (hotelweb) şu anda deploy edilmiyor, sadece API deploy ediliyor
- Railway ücretsiz planında aylık 500 saat çalışma süresi var
- Uygulama 5 dakika boyunca kullanılmazsa otomatik olarak uyku moduna geçer
