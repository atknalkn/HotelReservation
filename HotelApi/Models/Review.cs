using System.ComponentModel.DataAnnotations;

namespace HotelApi.Models
{
    public class Review
    {
        public int Id { get; set; }
        
        // Hangi otel için yorum yapıldığı
        public int HotelId { get; set; }
        
        // Hangi property için yorum yapıldığı (opsiyonel)
        public int? PropertyId { get; set; }
        
        // Hangi oda tipi için yorum yapıldığı (opsiyonel)
        public int? RoomTypeId { get; set; }
        
        // Yorum yapan kullanıcı
        public int UserId { get; set; }
        
        // Hangi rezervasyon üzerinden yorum yapıldığı
        public int ReservationId { get; set; }
        
        // Genel puan (1-5)
        [Range(1, 5)]
        public int OverallRating { get; set; }
        
        // Detay puanları
        [Range(1, 5)]
        public int CleanlinessRating { get; set; }
        
        [Range(1, 5)]
        public int ServiceRating { get; set; }
        
        [Range(1, 5)]
        public int LocationRating { get; set; }
        
        [Range(1, 5)]
        public int ValueRating { get; set; }
        
        // Yorum metni
        [Required]
        [StringLength(1000)]
        public string Comment { get; set; } = "";
        
        // Yorum tarihi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Yorum durumu (onaylanmış, bekliyor, reddedilmiş)
        public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
        
        // Admin notları (red sebebi için)
        public string? AdminNotes { get; set; }
        
        // Navigation properties
        public Hotel? Hotel { get; set; }
        public Property? Property { get; set; }
        public RoomType? RoomType { get; set; }
        public User? User { get; set; }
        public Reservation? Reservation { get; set; }
    }
    
    public enum ReviewStatus
    {
        Pending = 0,    // Admin onayı bekliyor
        Approved = 1,   // Yayında
        Rejected = 2    // Reddedildi
    }
}
