namespace HotelApi.DTOs
{
    public class AvailabilityResponseDto
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = "";
        public DateTime Date { get; set; }
        public int Stock { get; set; }
        public decimal? PriceOverride { get; set; }
        public decimal EffectivePrice { get; set; }
    }
}
