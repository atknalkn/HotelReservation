namespace HotelApi.Models
{
    public class RoomType
    {
        public int Id { get; set; }
        
        // İstenilen alanlar
        public int PropertyId { get; set; }           // FK -> Properties(Id)
        public string Name { get; set; } = "";        // Örn: "Standart Oda", "Deluxe Suite"
        public int Capacity { get; set; }             // Kaç kişilik (1, 2, 3, 4+)
        public decimal BasePrice { get; set; }        // Temel fiyat (gecelik)
        public string Description { get; set; } = ""; // Detaylı açıklama
        
        // Review sistemi için ortalama puanlar
        public decimal AverageOverallRating { get; set; } = 0;
        public decimal AverageCleanlinessRating { get; set; } = 0;
        public decimal AverageServiceRating { get; set; } = 0;
        public decimal AverageLocationRating { get; set; } = 0;
        public decimal AverageValueRating { get; set; } = 0;
        public int TotalReviews { get; set; } = 0;

        // Timestamp
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Property? Property { get; set; }
        public ICollection<Availability>? Availabilities { get; set; } = new List<Availability>();
        public ICollection<Review>? Reviews { get; set; } = new List<Review>();
    }
}
