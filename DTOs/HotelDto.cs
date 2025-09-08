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
        public int StarRating { get; set; } = 3;
        public string Description { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Website { get; set; } = "";
        public string Amenities { get; set; } = "";
        public string CheckInTime { get; set; } = "14:00";
        public string CheckOutTime { get; set; } = "11:00";
        public string Policies { get; set; } = "";
        // Status artık admin tarafından yönetilir, burada değiştirilemez
    }

    public class HotelResponseDto
    {
        public int Id { get; set; }
        public int OwnerUserId { get; set; }
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public string Address { get; set; } = "";
        public string TaxNo { get; set; } = "";
        public string Status { get; set; } = "";
        public int StarRating { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto? OwnerUser { get; set; }
    }

    public class HotelApprovalDto
    {
        public string? AdminNotes { get; set; }
    }

    public class HotelRejectionDto
    {
        public string Reason { get; set; } = "";
        public string? AdminNotes { get; set; }
    }
}
