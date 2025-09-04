# 🌐 Cloud Deployment Rehberi

## Hızlı Başlangıç - Vercel + Railway

### 1. Frontend'i Vercel'e Deploy Et

```bash
# 1. Vercel CLI kur
npm install -g vercel

# 2. Frontend klasörüne git
cd hotelweb

# 3. Vercel'e login ol
vercel login

# 4. Deploy et
vercel

# 5. Production URL'i al (örn: https://hotel-reservation-abc123.vercel.app)
```

### 2. Backend'i Railway'e Deploy Et

1. **Railway.app**'e git ve GitHub ile giriş yap
2. **New Project** > **Deploy from GitHub repo** seç
3. Repo'nu seç ve **HotelApi** klasörünü seç
4. **Add Database** > **PostgreSQL** ekle
5. Environment variables ekle:
   ```
   ConnectionStrings__DefaultConnection = ${{Postgres.DATABASE_URL}}
   JwtSettings__SecretKey = your-super-secret-production-key-here
   JwtSettings__Issuer = HotelReservationAPI
   JwtSettings__Audience = HotelReservationUsers
   JwtSettings__ExpirationInMinutes = 60
   ```
6. **Deploy** butonuna bas
7. Backend URL'ini al (örn: https://hotel-api-production.up.railway.app)

### 3. Frontend'i Backend'e Bağla

```bash
# Frontend klasöründe
cd hotelweb

# Environment variable güncelle
vercel env add NEXT_PUBLIC_API_BASE_URL
# Railway'den aldığın backend URL'ini gir

# Yeniden deploy et
vercel --prod
```

## Alternatif: Heroku Deployment

### Backend (Heroku)

```bash
# 1. Heroku CLI kur
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Backend klasörüne git
cd HotelApi

# 3. Heroku app oluştur
heroku create your-hotel-api-name

# 4. PostgreSQL addon ekle
heroku addons:create heroku-postgresql:hobby-dev

# 5. Environment variables set et
heroku config:set JwtSettings__SecretKey="your-super-secret-production-key"
heroku config:set JwtSettings__Issuer="HotelReservationAPI"
heroku config:set JwtSettings__Audience="HotelReservationUsers"
heroku config:set JwtSettings__ExpirationInMinutes="60"

# 6. Deploy et
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 7. Database migration çalıştır
heroku run dotnet ef database update
```

### Frontend (Heroku)

```bash
# 1. Frontend klasörüne git
cd hotelweb

# 2. Heroku app oluştur
heroku create your-hotel-frontend-name

# 3. Buildpack ekle
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git

# 4. Environment variable set et
heroku config:set NEXT_PUBLIC_API_BASE_URL="https://your-hotel-api-name.herokuapp.com"

# 5. Deploy et
git add .
git commit -m "Deploy frontend to Heroku"
git push heroku main
```

## 🎯 Sonuç

Deployment tamamlandıktan sonra:

- **Frontend URL**: https://your-frontend-url.vercel.app
- **Backend URL**: https://your-backend-url.railway.app
- **API Health**: https://your-backend-url.railway.app/health
- **Swagger**: https://your-backend-url.railway.app/swagger

## 🔧 Troubleshooting

### CORS Hatası
Backend'de CORS ayarlarını güncelle:
```csharp
policy.WithOrigins("https://your-frontend-url.vercel.app")
```

### Database Bağlantı Hatası
Railway'de PostgreSQL URL'ini kontrol et ve environment variable'ları doğrula.

### Frontend Build Hatası
Vercel'de build loglarını kontrol et ve Next.js konfigürasyonunu doğrula.

## 📱 Mobil Erişim

Deploy edildikten sonra:
- Herhangi bir cihazdan URL'e giderek erişebilirsiniz
- Responsive tasarım sayesinde mobilde de mükemmel çalışır
- PWA özellikleri ile mobil uygulama gibi kullanılabilir

---

**Artık projeniz tüm dünyadan erişilebilir! 🌍**
