using System.ComponentModel.DataAnnotations;

namespace HotelApi.DTOs
{
    public class AvailabilityCheckDto
    {
        [Required]
        public int RoomTypeId { get; set; }
        
        [Required]
        public DateTime CheckIn { get; set; }
        
        [Required]
        public DateTime CheckOut { get; set; }
        
        [Required]
        [Range(1, 10)]
        public int Guests { get; set; }
    }
}
