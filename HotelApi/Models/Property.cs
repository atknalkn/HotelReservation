namespace HotelApi.Models
{
    public class Property
    {
        public int Id { get; set; }

        // İstenilen alanlar
        public int HotelId { get; set; }                 // FK -> Hotels(Id)
        public string Title { get; set; } = "";          // Örn: "Standart Oda", "Suit Oda"
        public string Description { get; set; } = "";    // Kısa açıklama
        public string City { get; set; } = "";           // Mülkün bulunduğu şehir
        public string Address { get; set; } = "";        // Açık adres
        public int Stars { get; set; }                   // 1-5
        public string Location { get; set; } = "";       // "41.0, 31.1" gibi enlem-boylam (string)

        // Review sistemi için ortalama puanlar
        public decimal AverageOverallRating { get; set; } = 0;
        public decimal AverageCleanlinessRating { get; set; } = 0;
        public decimal AverageServiceRating { get; set; } = 0;
        public decimal AverageLocationRating { get; set; } = 0;
        public decimal AverageValueRating { get; set; } = 0;
        public int TotalReviews { get; set; } = 0;

        // Navigation
        public Hotel? Hotel { get; set; }
        public ICollection<RoomType>? RoomTypes { get; set; } = new List<RoomType>();
        public ICollection<Review>? Reviews { get; set; } = new List<Review>();
    }
}
