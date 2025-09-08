using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelApi.Models
{
    public class Reservation
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int HotelId { get; set; }
        
        [Required]
        public int PropertyId { get; set; }
        
        [Required]
        public int RoomTypeId { get; set; }
        
        [Required]
        [Column(TypeName = "date")]
        public DateTime CheckIn { get; set; }
        
        [Required]
        [Column(TypeName = "date")]
        public DateTime CheckOut { get; set; }
        
        [Required]
        [Range(1, 10)]
        public int Guests { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
        
        // Komisyon alanları
        [Column(TypeName = "decimal(18,2)")]
        public decimal CommissionAmount { get; set; } = 0; // Hesaplanan komisyon tutarı
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; } = 0; // Otel sahibine gidecek net tutar (TotalPrice - CommissionAmount)
        
        [Required]
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
        
        [ForeignKey("HotelId")]
        public Hotel? Hotel { get; set; }
        
        [ForeignKey("PropertyId")]
        public Property? Property { get; set; }
        
        [ForeignKey("RoomTypeId")]
        public RoomType? RoomType { get; set; }
    }
    
    public enum ReservationStatus
    {
        Pending,    // Beklemede
        Confirmed,  // Onaylandı
        Cancelled,  // İptal edildi
        Completed,  // Tamamlandı
        NoShow      // Gelmedi
    }
}
