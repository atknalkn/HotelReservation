namespace HotelApi.DTOs
{
    public class AvailabilityDto
    {
        public int RoomTypeId { get; set; }
        public DateTime Date { get; set; }
        public int Stock { get; set; }
        public decimal? PriceOverride { get; set; }
    }
}
