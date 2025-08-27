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
        
        // Navigation
        public Property? Property { get; set; }
        public ICollection<Availability>? Availabilities { get; set; } = new List<Availability>();
    }
}
