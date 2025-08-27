namespace HotelApi.DTOs
{
    public class RoomTypeDto
    {
        public int PropertyId { get; set; }
        public string Name { get; set; } = "";
        public int Capacity { get; set; }
        public decimal BasePrice { get; set; }
        public string Description { get; set; } = "";
    }
}
