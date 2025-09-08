using System.ComponentModel.DataAnnotations;

namespace HotelApi.DTOs
{
    public class CommissionSettingsDto
    {
        [Range(0, 100)]
        public decimal CommissionRate { get; set; } = 15.0m;
        
        public decimal MinimumCommission { get; set; } = 5.0m;
        
        public decimal MaximumCommission { get; set; } = 0.0m;
        
        public string CalculationMethod { get; set; } = "Percentage";
        
        public bool IsActive { get; set; } = true;
    }

    public class CommissionSettingsResponseDto
    {
        public int Id { get; set; }
        public decimal CommissionRate { get; set; }
        public decimal MinimumCommission { get; set; }
        public decimal MaximumCommission { get; set; }
        public string CalculationMethod { get; set; } = "";
        public bool IsActive { get; set; }
        public DateTime LastUpdated { get; set; }
        public int UpdatedByUserId { get; set; }
        public string? UpdatedByUserEmail { get; set; }
    }

    public class CommissionCalculationDto
    {
        public decimal TotalPrice { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal NetAmount { get; set; }
        public decimal CommissionRate { get; set; }
        public string CalculationMethod { get; set; } = "";
    }

    public class CommissionReportDto
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public int TotalReservations { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal TotalNetAmount { get; set; }
        public List<CommissionDetailDto> Details { get; set; } = new List<CommissionDetailDto>();
    }

    public class CommissionDetailDto
    {
        public int ReservationId { get; set; }
        public string HotelName { get; set; } = "";
        public string PropertyTitle { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal NetAmount { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}
