using HotelApi.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization; // <= JSON'da enum'ları string olarak kabul etmek için

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
