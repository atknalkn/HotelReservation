using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelApi.Services;
using HotelApi.DTOs;

namespace HotelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")] // Sadece admin'ler komisyon ayarlarını yönetebilir
    public class CommissionController : ControllerBase
    {
        private readonly ICommissionService _commissionService;
        private readonly ILogger<CommissionController> _logger;

        public CommissionController(ICommissionService commissionService, ILogger<CommissionController> logger)
        {
            _commissionService = commissionService;
            _logger = logger;
        }

        // GET: api/commission/settings - Mevcut komisyon ayarlarını getir
        [HttpGet("settings")]
        public async Task<ActionResult<CommissionSettingsResponseDto>> GetCurrentSettings()
        {
            try
            {
                var settings = await _commissionService.GetCurrentSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting commission settings");
                return StatusCode(500, "Komisyon ayarları alınamadı");
            }
        }

        // PUT: api/commission/settings - Komisyon ayarlarını güncelle
        [HttpPut("settings")]
        public async Task<ActionResult<CommissionSettingsResponseDto>> UpdateSettings([FromBody] CommissionSettingsDto settingsDto)
        {
            try
            {
                // Admin user ID'sini JWT token'dan al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int adminUserId))
                {
                    return Unauthorized();
                }

                // Validasyon
                if (settingsDto.CommissionRate < 0 || settingsDto.CommissionRate > 100)
                {
                    return BadRequest("Komisyon oranı 0-100 arasında olmalıdır");
                }

                if (settingsDto.MinimumCommission < 0)
                {
                    return BadRequest("Minimum komisyon tutarı negatif olamaz");
                }

                if (settingsDto.MaximumCommission < 0)
                {
                    return BadRequest("Maksimum komisyon tutarı negatif olamaz");
                }

                if (settingsDto.MaximumCommission > 0 && settingsDto.MinimumCommission > settingsDto.MaximumCommission)
                {
                    return BadRequest("Minimum komisyon, maksimum komisyondan büyük olamaz");
                }

                var updatedSettings = await _commissionService.UpdateSettingsAsync(settingsDto, adminUserId);
                return Ok(updatedSettings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating commission settings");
                return StatusCode(500, "Komisyon ayarları güncellenemedi");
            }
        }

        // POST: api/commission/calculate - Komisyon hesapla (test amaçlı)
        [HttpPost("calculate")]
        public async Task<ActionResult<CommissionCalculationDto>> CalculateCommission([FromBody] decimal totalPrice)
        {
            try
            {
                if (totalPrice <= 0)
                {
                    return BadRequest("Toplam fiyat pozitif olmalıdır");
                }

                var calculation = await _commissionService.CalculateCommissionAsync(totalPrice);
                return Ok(calculation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating commission");
                return StatusCode(500, "Komisyon hesaplanamadı");
            }
        }

        // GET: api/commission/report - Komisyon raporu oluştur
        [HttpGet("report")]
        public async Task<ActionResult<CommissionReportDto>> GenerateReport(
            [FromQuery] DateTime dateFrom, 
            [FromQuery] DateTime dateTo)
        {
            try
            {
                if (dateFrom >= dateTo)
                {
                    return BadRequest("Başlangıç tarihi bitiş tarihinden önce olmalıdır");
                }

                // Maksimum 1 yıllık rapor
                if (dateTo - dateFrom > TimeSpan.FromDays(365))
                {
                    return BadRequest("Maksimum 1 yıllık rapor oluşturulabilir");
                }

                var report = await _commissionService.GenerateCommissionReportAsync(dateFrom, dateTo);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating commission report");
                return StatusCode(500, "Komisyon raporu oluşturulamadı");
            }
        }

        // GET: api/commission/details - Komisyon detaylarını getir
        [HttpGet("details")]
        public async Task<ActionResult<List<CommissionDetailDto>>> GetCommissionDetails(
            [FromQuery] DateTime dateFrom, 
            [FromQuery] DateTime dateTo)
        {
            try
            {
                if (dateFrom >= dateTo)
                {
                    return BadRequest("Başlangıç tarihi bitiş tarihinden önce olmalıdır");
                }

                // Maksimum 3 aylık detay
                if (dateTo - dateFrom > TimeSpan.FromDays(90))
                {
                    return BadRequest("Maksimum 3 aylık detay görüntülenebilir");
                }

                var details = await _commissionService.GetCommissionDetailsAsync(dateFrom, dateTo);
                return Ok(details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting commission details");
                return StatusCode(500, "Komisyon detayları alınamadı");
            }
        }

        // GET: api/commission/summary - Özet komisyon bilgileri
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetCommissionSummary()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var thisMonth = new DateTime(today.Year, today.Month, 1);
                var lastMonth = thisMonth.AddMonths(-1);

                var thisMonthReport = await _commissionService.GenerateCommissionReportAsync(thisMonth, today);
                var lastMonthReport = await _commissionService.GenerateCommissionReportAsync(lastMonth, thisMonth);

                return Ok(new
                {
                    thisMonth = new
                    {
                        totalReservations = thisMonthReport.TotalReservations,
                        totalRevenue = thisMonthReport.TotalRevenue,
                        totalCommission = thisMonthReport.TotalCommission,
                        totalNetAmount = thisMonthReport.TotalNetAmount
                    },
                    lastMonth = new
                    {
                        totalReservations = lastMonthReport.TotalReservations,
                        totalRevenue = lastMonthReport.TotalRevenue,
                        totalCommission = lastMonthReport.TotalCommission,
                        totalNetAmount = lastMonthReport.TotalNetAmount
                    },
                    generatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting commission summary");
                return StatusCode(500, "Komisyon özeti alınamadı");
            }
        }
    }
}
