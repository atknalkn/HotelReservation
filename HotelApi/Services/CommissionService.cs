using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HotelApi.Services
{
    public interface ICommissionService
    {
        Task<CommissionSettingsResponseDto> GetCurrentSettingsAsync();
        Task<CommissionSettingsResponseDto> UpdateSettingsAsync(CommissionSettingsDto settingsDto, int adminUserId);
        Task<CommissionCalculationDto> CalculateCommissionAsync(decimal totalPrice);
        Task<decimal> CalculateCommissionForReservationAsync(decimal totalPrice);
        Task<CommissionReportDto> GenerateCommissionReportAsync(DateTime dateFrom, DateTime dateTo);
        Task<List<CommissionDetailDto>> GetCommissionDetailsAsync(DateTime dateFrom, DateTime dateTo);
    }

    public class CommissionService : ICommissionService
    {
        private readonly HotelDbContext _context;
        private readonly ILogger<CommissionService> _logger;

        public CommissionService(HotelDbContext context, ILogger<CommissionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CommissionSettingsResponseDto> GetCurrentSettingsAsync()
        {
            var settings = await _context.CommissionSettings
                .Where(cs => cs.IsActive)
                .OrderByDescending(cs => cs.LastUpdated)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                // Varsayılan ayarları döndür
                return new CommissionSettingsResponseDto
                {
                    Id = 0,
                    CommissionRate = 15.0m,
                    MinimumCommission = 5.0m,
                    MaximumCommission = 0.0m,
                    CalculationMethod = "Percentage",
                    IsActive = true,
                    LastUpdated = DateTime.UtcNow,
                    UpdatedByUserId = 0
                };
            }

            return new CommissionSettingsResponseDto
            {
                Id = settings.Id,
                CommissionRate = settings.CommissionRate,
                MinimumCommission = settings.MinimumCommission,
                MaximumCommission = settings.MaximumCommission,
                CalculationMethod = settings.CalculationMethod.ToString(),
                IsActive = settings.IsActive,
                LastUpdated = settings.LastUpdated,
                UpdatedByUserId = settings.UpdatedByUserId,
                UpdatedByUserEmail = settings.UpdatedByUser?.Email
            };
        }

        public async Task<CommissionSettingsResponseDto> UpdateSettingsAsync(CommissionSettingsDto settingsDto, int adminUserId)
        {
            // Mevcut aktif ayarları pasif yap
            var activeSettings = await _context.CommissionSettings
                .Where(cs => cs.IsActive)
                .ToListAsync();

            foreach (var setting in activeSettings)
            {
                setting.IsActive = false;
            }

            // Yeni ayarları ekle
            var newSettings = new CommissionSettings
            {
                CommissionRate = settingsDto.CommissionRate,
                MinimumCommission = settingsDto.MinimumCommission,
                MaximumCommission = settingsDto.MaximumCommission,
                CalculationMethod = Enum.Parse<CommissionCalculationMethod>(settingsDto.CalculationMethod),
                IsActive = true,
                LastUpdated = DateTime.UtcNow,
                UpdatedByUserId = adminUserId
            };

            _context.CommissionSettings.Add(newSettings);
            await _context.SaveChangesAsync();

            return await GetCurrentSettingsAsync();
        }

        public async Task<CommissionCalculationDto> CalculateCommissionAsync(decimal totalPrice)
        {
            var settings = await GetCurrentSettingsAsync();
            var commissionAmount = await CalculateCommissionForReservationAsync(totalPrice);

            return new CommissionCalculationDto
            {
                TotalPrice = totalPrice,
                CommissionAmount = commissionAmount,
                NetAmount = totalPrice - commissionAmount,
                CommissionRate = settings.CommissionRate,
                CalculationMethod = settings.CalculationMethod
            };
        }

        public async Task<decimal> CalculateCommissionForReservationAsync(decimal totalPrice)
        {
            var settings = await GetCurrentSettingsAsync();
            decimal commissionAmount = 0;

            switch (settings.CalculationMethod)
            {
                case "Percentage":
                    commissionAmount = totalPrice * (settings.CommissionRate / 100);
                    break;
                case "FixedAmount":
                    commissionAmount = settings.CommissionRate;
                    break;
                case "Tiered":
                    // Basit kademeli hesaplama (0-100 TL: %10, 100+ TL: %15)
                    if (totalPrice <= 100)
                        commissionAmount = totalPrice * 0.10m;
                    else
                        commissionAmount = (100 * 0.10m) + ((totalPrice - 100) * 0.15m);
                    break;
            }

            // Minimum ve maksimum komisyon kontrolü
            if (settings.MinimumCommission > 0 && commissionAmount < settings.MinimumCommission)
                commissionAmount = settings.MinimumCommission;

            if (settings.MaximumCommission > 0 && commissionAmount > settings.MaximumCommission)
                commissionAmount = settings.MaximumCommission;

            return Math.Round(commissionAmount, 2);
        }

        public async Task<CommissionReportDto> GenerateCommissionReportAsync(DateTime dateFrom, DateTime dateTo)
        {
            var details = await GetCommissionDetailsAsync(dateFrom, dateTo);

            var report = new CommissionReportDto
            {
                DateFrom = dateFrom,
                DateTo = dateTo,
                TotalReservations = details.Count,
                TotalRevenue = details.Sum(d => d.TotalPrice),
                TotalCommission = details.Sum(d => d.CommissionAmount),
                TotalNetAmount = details.Sum(d => d.NetAmount),
                Details = details
            };

            return report;
        }

        public async Task<List<CommissionDetailDto>> GetCommissionDetailsAsync(DateTime dateFrom, DateTime dateTo)
        {
            var reservations = await _context.Reservations
                .Where(r => r.CreatedAt >= dateFrom && r.CreatedAt <= dateTo)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.User)
                .ToListAsync();

            var details = new List<CommissionDetailDto>();

            foreach (var reservation in reservations)
            {
                details.Add(new CommissionDetailDto
                {
                    ReservationId = reservation.Id,
                    HotelName = reservation.Hotel?.Name ?? "",
                    PropertyTitle = reservation.Property?.Title ?? "",
                    CustomerEmail = reservation.User?.Email ?? "",
                    CheckIn = reservation.CheckIn,
                    CheckOut = reservation.CheckOut,
                    TotalPrice = reservation.TotalPrice,
                    CommissionAmount = reservation.CommissionAmount,
                    NetAmount = reservation.NetAmount,
                    Status = reservation.Status.ToString(),
                    CreatedAt = reservation.CreatedAt
                });
            }

            return details;
        }
    }
}
