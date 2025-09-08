using System.ComponentModel.DataAnnotations;

namespace HotelApi.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public int HotelId { get; set; }
        
        public int? PropertyId { get; set; }
        
        public int? RoomTypeId { get; set; }
        
        [Required]
        public int ReservationId { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int OverallRating { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int CleanlinessRating { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int ServiceRating { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int LocationRating { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int ValueRating { get; set; }
        
        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string Comment { get; set; } = "";
    }

    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public string HotelName { get; set; } = "";
        public int? PropertyId { get; set; }
        public string? PropertyTitle { get; set; }
        public int? RoomTypeId { get; set; }
        public string? RoomTypeName { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; } = "";
        public int ReservationId { get; set; }
        public int OverallRating { get; set; }
        public int CleanlinessRating { get; set; }
        public int ServiceRating { get; set; }
        public int LocationRating { get; set; }
        public int ValueRating { get; set; }
        public string Comment { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = "";
        public string? AdminNotes { get; set; }
    }

    public class ReviewUpdateDto
    {
        [Range(1, 5)]
        public int? OverallRating { get; set; }
        
        [Range(1, 5)]
        public int? CleanlinessRating { get; set; }
        
        [Range(1, 5)]
        public int? ServiceRating { get; set; }
        
        [Range(1, 5)]
        public int? LocationRating { get; set; }
        
        [Range(1, 5)]
        public int? ValueRating { get; set; }
        
        [StringLength(1000, MinimumLength = 10)]
        public string? Comment { get; set; }
    }

    public class ReviewApprovalDto
    {
        public string? AdminNotes { get; set; }
    }

    public class ReviewRejectionDto
    {
        [Required]
        public string Reason { get; set; } = "";
        public string? AdminNotes { get; set; }
    }

    public class ReviewSummaryDto
    {
        public int TotalReviews { get; set; }
        public decimal AverageOverallRating { get; set; }
        public decimal AverageCleanlinessRating { get; set; }
        public decimal AverageServiceRating { get; set; }
        public decimal AverageLocationRating { get; set; }
        public decimal AverageValueRating { get; set; }
        public int FiveStarCount { get; set; }
        public int FourStarCount { get; set; }
        public int ThreeStarCount { get; set; }
        public int TwoStarCount { get; set; }
        public int OneStarCount { get; set; }
        public List<ReviewResponseDto> RecentReviews { get; set; } = new List<ReviewResponseDto>();
    }

    public class ReviewFilterDto
    {
        public int? HotelId { get; set; }
        public int? PropertyId { get; set; }
        public int? RoomTypeId { get; set; }
        public int? MinRating { get; set; }
        public int? MaxRating { get; set; }
        public string? Status { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
