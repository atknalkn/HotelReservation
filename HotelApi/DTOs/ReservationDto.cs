namespace HotelApi.DTOs
{
    public class ReservationDto
    {
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public int PropertyId { get; set; }
        public int RoomTypeId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
    }
}
