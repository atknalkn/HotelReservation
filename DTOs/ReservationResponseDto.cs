namespace HotelApi.DTOs
{
    public class ReservationResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; } = "";
        public int HotelId { get; set; }
        public string HotelName { get; set; } = "";
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = "";
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = "";
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public int TotalNights { get; set; }
    }
}
