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

        // Navigation
        public User? OwnerUser { get; set; }
        public ICollection<Reservation>? Reservations { get; set; } = new List<Reservation>();
    }
}
