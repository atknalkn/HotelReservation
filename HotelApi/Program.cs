using HotelApi.Data;
using HotelApi.Services;
using HotelApi.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization; // <= JSON'da enum'ları string olarak kabul etmek için
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings?.SecretKey ?? "default-key")),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings?.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings?.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("HotelOwnerOnly", policy => policy.RequireRole("HotelOwner"));
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
});

// JWT Service
builder.Services.AddScoped<IJwtService, JwtService>();

// Commission Service
builder.Services.AddScoped<ICommissionService, CommissionService>();

// Review Service
builder.Services.AddScoped<IReviewService, ReviewService>();

// Eğer Railway DATABASE_URL formatında veriyorsa, onu parse et
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connectionString;

if (!string.IsNullOrEmpty(databaseUrl))
{
    // örn: postgresql://user:pass@host:5432/dbname
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':');

    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    // Lokal geliştirme için appsettings'deki connection string
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

// DbContext'e ver
builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseNpgsql(connectionString));

// Logging
builder.Services.AddLogging();

// Controllers + JSON enum ayarı (string kabul et)
builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        // "Approved", "Pending", "Rejected" gibi string enum değerlerini kabul etsin/dönsün
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        
        // Circular reference'ı önle
        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        
        // Navigation property'leri serialize etme
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hotel API", Version = "v1" });
    
    // JWT authentication support
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel API v1");
    c.RoutePrefix = "swagger";
});

// Global exception handler
app.UseExceptionHandler("/error");

app.UseHttpsRedirection();

// CORS middleware - must be before authentication
app.UseCors("AllowFrontend");

// Authentication ve Authorization middleware'leri
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => "API is running!");

// Railway port configuration
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";

// --- Automatic Migration ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HotelDbContext>();
    db.Database.Migrate();
}

app.Run($"http://0.0.0.0:{port}");