using HotelApi.Models;

namespace HotelApi.DTOs
{
    public class HotelDto
    {
        public int OwnerUserId { get; set; }
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public string Address { get; set; } = "";
        public string TaxNo { get; set; } = "";
        public HotelStatus Status { get; set; } = HotelStatus.Pending;
        public int StarRating { get; set; }
    }
}
