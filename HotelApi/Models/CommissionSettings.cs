using System.ComponentModel.DataAnnotations;

namespace HotelApi.Models
{
    public class CommissionSettings
    {
        public int Id { get; set; }
        
        // Platform komisyon oranı (yüzde olarak, örn: 15.5 = %15.5)
        [Range(0, 100)]
        public decimal CommissionRate { get; set; } = 15.0m; // Varsayılan %15
        
        // Minimum komisyon tutarı
        public decimal MinimumCommission { get; set; } = 5.0m; // Varsayılan 5 TL
        
        // Maksimum komisyon tutarı (0 = sınırsız)
        public decimal MaximumCommission { get; set; } = 0.0m; // Varsayılan sınırsız
        
        // Komisyon hesaplama yöntemi
        public CommissionCalculationMethod CalculationMethod { get; set; } = CommissionCalculationMethod.Percentage;
        
        // Aktif mi?
        public bool IsActive { get; set; } = true;
        
        // Son güncelleme tarihi
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // Güncelleyen admin kullanıcı ID'si
        public int UpdatedByUserId { get; set; }
        
        // Navigation property
        public User? UpdatedByUser { get; set; }
    }
    
    public enum CommissionCalculationMethod
    {
        Percentage,     // Yüzde bazlı (örn: %15)
        FixedAmount,    // Sabit tutar (örn: 10 TL)
        Tiered          // Kademeli (örn: 0-100 TL: %10, 100+ TL: %15)
    }
}
