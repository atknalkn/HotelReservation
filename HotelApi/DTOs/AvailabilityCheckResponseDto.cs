namespace HotelApi.DTOs
{
    public class AvailabilityCheckResponseDto
    {
        public bool IsAvailable { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int TotalNights { get; set; }
        public List<AvailabilityInfoDto> AvailabilityInfo { get; set; } = new();
    }

    public class AvailabilityInfoDto
    {
        public DateTime Date { get; set; }
        public int AvailableStock { get; set; }
        public decimal Price { get; set; }
    }
}
