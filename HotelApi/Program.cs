// using HotelApi.Data;
// using HotelApi.Services;
// using HotelApi.DTOs;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.IdentityModel.Tokens;
// using System.Text;
// using System.Text.Json.Serialization; // <= JSON'da enum'ları string olarak kabul etmek için
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001", 
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                "https://hotel-reservation-gold-phi.vercel.app" // Vercel frontend URL'i
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Settings - Geçici olarak devre dışı bırakıyoruz
// var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
// builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// JWT Authentication - Geçici olarak devre dışı bırakıyoruz
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(options =>
//     {
//         options.TokenValidationParameters = new TokenValidationParameters
//         {
//             ValidateIssuerSigningKey = true,
//             IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings?.SecretKey ?? "default-key")),
//             ValidateIssuer = true,
//             ValidIssuer = jwtSettings?.Issuer,
//             ValidateAudience = true,
//             ValidAudience = jwtSettings?.Audience,
//             ValidateLifetime = true,
//             ClockSkew = TimeSpan.Zero
//         };
//     });

// Authorization Policies - Geçici olarak devre dışı bırakıyoruz
// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
//     options.AddPolicy("HotelOwnerOnly", policy => policy.RequireRole("HotelOwner"));
//     options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
// });

// JWT Service - Geçici olarak devre dışı bırakıyoruz
// builder.Services.AddScoped<IJwtService, JwtService>();

// Commission Service - Geçici olarak devre dışı bırakıyoruz
// builder.Services.AddScoped<ICommissionService, CommissionService>();

// Review Service - Geçici olarak devre dışı bırakıyoruz
// builder.Services.AddScoped<IReviewService, ReviewService>();

// DbContext - Geçici olarak devre dışı bırakıyoruz
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
//     ?? Environment.GetEnvironmentVariable("DATABASE_URL")
//     ?? "Host=localhost;Database=hotelreservation;Username=postgres;Password=password";

// builder.Services.AddDbContext<HotelDbContext>(options =>
//     options.UseNpgsql(connectionString));

// Logging
builder.Services.AddLogging();

// Controllers - Geçici olarak devre dışı bırakıyoruz
// builder.Services
//     .AddControllers()
//     .AddJsonOptions(o =>
//     {
//         // "Approved", "Pending", "Rejected" gibi string enum değerlerini kabul etsin/dönsün
//         o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
//         
//         // Circular reference'ı önle
//         o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
//         
//         // Navigation property'leri serialize etme
//         o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
//     });

// Swagger - Geçici olarak devre dışı bırakıyoruz
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hotel API", Version = "v1" });
//     
//     // JWT authentication support
//     c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//     {
//         Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
//         Name = "Authorization",
//         In = ParameterLocation.Header,
//         Type = SecuritySchemeType.ApiKey,
//         Scheme = "Bearer"
//     });
//     
//     c.AddSecurityRequirement(new OpenApiSecurityRequirement
//     {
//         {
//             new OpenApiSecurityScheme
//             {
//                 Reference = new OpenApiReference
//                 {
//                     Type = ReferenceType.SecurityScheme,
//                     Id = "Bearer"
//                 }
//             },
//             new string[] {}
//         }
//     });
// });

var app = builder.Build();

// Exception handling
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (exception != null)
        {
            var error = new
            {
                message = exception.Error.Message,
                stackTrace = exception.Error.StackTrace,
                innerException = exception.Error.InnerException?.Message
            };
            
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(error));
        }
    });
});

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Simple test endpoint
app.MapGet("/api/test", () => Results.Ok(new { message = "API is working!", timestamp = DateTime.UtcNow }));

// Pipeline - Geçici olarak devre dışı bırakıyoruz
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// Global exception handler
app.UseExceptionHandler("/error");

app.UseHttpsRedirection();

// CORS middleware - must be before authentication
app.UseCors("AllowFrontend");

// Authentication ve Authorization middleware'leri - Geçici olarak devre dışı bırakıyoruz
// app.UseAuthentication();
// app.UseAuthorization();

// app.MapControllers(); // Geçici olarak devre dışı bırakıyoruz

// Health check endpoint
app.MapGet("/health", () => "API is running!");

app.Run();
