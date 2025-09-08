namespace HotelApi.Models
{
    public enum HotelStatus
    {
        Pending = 0,   // Admin onayı bekliyor
        Approved = 1,  // Yayında
        Rejected = 2   // Reddedildi
    }

    public class Hotel
    {
        public int Id { get; set; }

        // İSTENEN YENİ ALANLAR
        public int OwnerUserId { get; set; }                // User ile ilişki (FK)
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public string Address { get; set; } = "";
        public string TaxNo { get; set; } = "";             // Vergi No
        public HotelStatus Status { get; set; } = HotelStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Başvuru tarihi

        // Opsiyonel: Yıldız bilgisini korumak istersen
        public int StarRating { get; set; }  // 1-5 (istersen şimdilik bırak, istersen kaldır)

        // Yeni eklenen alanlar
        public string Description { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Website { get; set; } = "";
        public string Amenities { get; set; } = "";
        public string CheckInTime { get; set; } = "14:00";
        public string CheckOutTime { get; set; } = "11:00";
        public string Policies { get; set; } = "";

        // Review sistemi için ortalama puanlar
        public decimal AverageOverallRating { get; set; } = 0;
        public decimal AverageCleanlinessRating { get; set; } = 0;

        public decimal AverageServiceRating { get; set; } = 0;
        public decimal AverageLocationRating { get; set; } = 0;
        public decimal AverageValueRating { get; set; } = 0;
        public int TotalReviews { get; set; } = 0;

        // Fiyat bilgisi
        public decimal? AveragePrice { get; set; }

        // Navigation
        public User? OwnerUser { get; set; }
        public ICollection<Reservation>? Reservations { get; set; } = new List<Reservation>();
        public ICollection<Review>? Reviews { get; set; } = new List<Review>();
    }
}
