using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HotelApi.Services
{
    public interface IReviewService
    {
        Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto createReviewDto, int userId);
        Task<ReviewResponseDto?> GetReviewByIdAsync(int reviewId);
        Task<List<ReviewResponseDto>> GetReviewsByHotelAsync(int hotelId, int page = 1, int pageSize = 10);
        Task<List<ReviewResponseDto>> GetReviewsByPropertyAsync(int propertyId, int page = 1, int pageSize = 10);
        Task<List<ReviewResponseDto>> GetReviewsByRoomTypeAsync(int roomTypeId, int page = 1, int pageSize = 10);
        Task<List<ReviewResponseDto>> GetReviewsByUserAsync(int userId, int page = 1, int pageSize = 10);
        Task<ReviewResponseDto> UpdateReviewAsync(int reviewId, ReviewUpdateDto updateDto, int userId);
        Task<bool> DeleteReviewAsync(int reviewId, int userId);
        Task<ReviewResponseDto> ApproveReviewAsync(int reviewId, ReviewApprovalDto approvalDto, int adminUserId);
        Task<ReviewResponseDto> RejectReviewAsync(int reviewId, ReviewRejectionDto rejectionDto, int adminUserId);
        Task<ReviewSummaryDto> GetReviewSummaryAsync(int? hotelId = null, int? propertyId = null, int? roomTypeId = null);
        Task<List<ReviewResponseDto>> GetPendingReviewsAsync(int page = 1, int pageSize = 10);
        Task<List<ReviewResponseDto>> GetFilteredReviewsAsync(ReviewFilterDto filterDto);
        Task UpdateAverageRatingsAsync(int hotelId, int? propertyId = null, int? roomTypeId = null);
    }

    public class ReviewService : IReviewService
    {
        private readonly HotelDbContext _context;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(HotelDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto createReviewDto, int userId)
        {
            // Rezervasyon kontrolü - sadece tamamlanmış rezervasyonlar için yorum yapılabilir
            var reservation = await _context.Reservations
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.Id == createReviewDto.ReservationId && r.UserId == userId);

            if (reservation == null)
                throw new InvalidOperationException("Rezervasyon bulunamadı veya bu rezervasyon size ait değil");

            if (reservation.Status != ReservationStatus.Completed)
                throw new InvalidOperationException("Sadece tamamlanmış rezervasyonlar için yorum yapılabilir");

            // Daha önce yorum yapılmış mı kontrol et
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReservationId == createReviewDto.ReservationId);

            if (existingReview != null)
                throw new InvalidOperationException("Bu rezervasyon için zaten yorum yapılmış");

            // Yorum oluştur
            var review = new Review
            {
                HotelId = createReviewDto.HotelId,
                PropertyId = createReviewDto.PropertyId,
                RoomTypeId = createReviewDto.RoomTypeId,
                UserId = userId,
                ReservationId = createReviewDto.ReservationId,
                OverallRating = createReviewDto.OverallRating,
                CleanlinessRating = createReviewDto.CleanlinessRating,
                ServiceRating = createReviewDto.ServiceRating,
                LocationRating = createReviewDto.LocationRating,
                ValueRating = createReviewDto.ValueRating,
                Comment = createReviewDto.Comment,
                Status = ReviewStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Ortalama puanları güncelle
            await UpdateAverageRatingsAsync(createReviewDto.HotelId, createReviewDto.PropertyId, createReviewDto.RoomTypeId);

            return await GetReviewByIdAsync(review.Id) ?? throw new InvalidOperationException("Yorum oluşturulamadı");
        }

        public async Task<ReviewResponseDto?> GetReviewByIdAsync(int reviewId)
        {
            var review = await _context.Reviews
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null) return null;

            return new ReviewResponseDto
            {
                Id = review.Id,
                HotelId = review.HotelId,
                HotelName = review.Hotel?.Name ?? "",
                PropertyId = review.PropertyId,
                PropertyTitle = review.Property?.Title,
                RoomTypeId = review.RoomTypeId,
                RoomTypeName = review.RoomType?.Name,
                UserId = review.UserId,
                UserEmail = review.User?.Email ?? "",
                ReservationId = review.ReservationId,
                OverallRating = review.OverallRating,
                CleanlinessRating = review.CleanlinessRating,
                ServiceRating = review.ServiceRating,
                LocationRating = review.LocationRating,
                ValueRating = review.ValueRating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                Status = review.Status.ToString(),
                AdminNotes = review.AdminNotes
            };
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByHotelAsync(int hotelId, int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.HotelId == hotelId && r.Status == ReviewStatus.Approved)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                UserId = r.UserId,
                UserEmail = r.User?.Email ?? "",
                ReservationId = r.ReservationId,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                ServiceRating = r.ServiceRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status.ToString()
            }).ToList();
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByPropertyAsync(int propertyId, int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.PropertyId == propertyId && r.Status == ReviewStatus.Approved)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                PropertyId = r.PropertyId,
                UserId = r.UserId,
                UserEmail = r.User?.Email ?? "",
                ReservationId = r.ReservationId,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                ServiceRating = r.ServiceRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status.ToString()
            }).ToList();
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByRoomTypeAsync(int roomTypeId, int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.RoomTypeId == roomTypeId && r.Status == ReviewStatus.Approved)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                RoomTypeId = r.RoomTypeId,
                UserId = r.UserId,
                UserEmail = r.User?.Email ?? "",
                ReservationId = r.ReservationId,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                ServiceRating = r.ServiceRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status.ToString()
            }).ToList();
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByUserAsync(int userId, int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                HotelName = r.Hotel?.Name ?? "",
                PropertyId = r.PropertyId,
                PropertyTitle = r.Property?.Title,
                RoomTypeId = r.RoomTypeId,
                RoomTypeName = r.RoomType?.Name,
                UserId = r.UserId,
                ReservationId = r.ReservationId,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                ServiceRating = r.ServiceRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status.ToString()
            }).ToList();
        }

        public async Task<ReviewResponseDto> UpdateReviewAsync(int reviewId, ReviewUpdateDto updateDto, int userId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

            if (review == null)
                throw new InvalidOperationException("Yorum bulunamadı veya güncelleme yetkiniz yok");

            if (review.Status != ReviewStatus.Pending)
                throw new InvalidOperationException("Sadece bekleyen yorumlar güncellenebilir");

            // Alanları güncelle
            if (updateDto.OverallRating.HasValue) review.OverallRating = updateDto.OverallRating.Value;
            if (updateDto.CleanlinessRating.HasValue) review.CleanlinessRating = updateDto.CleanlinessRating.Value;
            if (updateDto.ServiceRating.HasValue) review.ServiceRating = updateDto.ServiceRating.Value;
            if (updateDto.LocationRating.HasValue) review.LocationRating = updateDto.LocationRating.Value;
            if (updateDto.ValueRating.HasValue) review.ValueRating = updateDto.ValueRating.Value;
            if (!string.IsNullOrEmpty(updateDto.Comment)) review.Comment = updateDto.Comment;

            await _context.SaveChangesAsync();

            // Ortalama puanları güncelle
            await UpdateAverageRatingsAsync(review.HotelId, review.PropertyId, review.RoomTypeId);

            return await GetReviewByIdAsync(review.Id) ?? throw new InvalidOperationException("Yorum güncellenemedi");
        }

        public async Task<bool> DeleteReviewAsync(int reviewId, int userId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

            if (review == null) return false;

            if (review.Status != ReviewStatus.Pending)
                throw new InvalidOperationException("Sadece bekleyen yorumlar silinebilir");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            // Ortalama puanları güncelle
            await UpdateAverageRatingsAsync(review.HotelId, review.PropertyId, review.RoomTypeId);

            return true;
        }

        public async Task<ReviewResponseDto> ApproveReviewAsync(int reviewId, ReviewApprovalDto approvalDto, int adminUserId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null)
                throw new InvalidOperationException("Yorum bulunamadı");

            if (review.Status != ReviewStatus.Pending)
                throw new InvalidOperationException("Yorum zaten onaylanmış veya reddedilmiş");

            review.Status = ReviewStatus.Approved;
            if (!string.IsNullOrEmpty(approvalDto.AdminNotes))
                review.AdminNotes = approvalDto.AdminNotes;

            await _context.SaveChangesAsync();

            // Ortalama puanları güncelle
            await UpdateAverageRatingsAsync(review.HotelId, review.PropertyId, review.RoomTypeId);

            return await GetReviewByIdAsync(review.Id) ?? throw new InvalidOperationException("Yorum onaylanamadı");
        }

        public async Task<ReviewResponseDto> RejectReviewAsync(int reviewId, ReviewRejectionDto rejectionDto, int adminUserId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null)
                throw new InvalidOperationException("Yorum bulunamadı");

            if (review.Status != ReviewStatus.Pending)
                throw new InvalidOperationException("Yorum zaten onaylanmış veya reddedilmiş");

            review.Status = ReviewStatus.Rejected;
            review.AdminNotes = rejectionDto.Reason;
            if (!string.IsNullOrEmpty(rejectionDto.AdminNotes))
                review.AdminNotes += $"\n\nAdmin Notu: {rejectionDto.AdminNotes}";

            await _context.SaveChangesAsync();

            return await GetReviewByIdAsync(review.Id) ?? throw new InvalidOperationException("Yorum reddedilemedi");
        }

        public async Task<ReviewSummaryDto> GetReviewSummaryAsync(int? hotelId = null, int? propertyId = null, int? roomTypeId = null)
        {
            var query = _context.Reviews.Where(r => r.Status == ReviewStatus.Approved);

            if (hotelId.HasValue)
                query = query.Where(r => r.HotelId == hotelId.Value);
            if (propertyId.HasValue)
                query = query.Where(r => r.PropertyId == propertyId.Value);
            if (roomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);

            var reviews = await query.ToListAsync();

            if (!reviews.Any())
                return new ReviewSummaryDto();

                            var summary = new ReviewSummaryDto
                {
                    TotalReviews = reviews.Count,
                    AverageOverallRating = (decimal)Math.Round(reviews.Average(r => r.OverallRating), 1),
                    AverageCleanlinessRating = (decimal)Math.Round(reviews.Average(r => r.CleanlinessRating), 1),
                    AverageServiceRating = (decimal)Math.Round(reviews.Average(r => r.ServiceRating), 1),
                    AverageLocationRating = (decimal)Math.Round(reviews.Average(r => r.LocationRating), 1),
                    AverageValueRating = (decimal)Math.Round(reviews.Average(r => r.ValueRating), 1),
                    FiveStarCount = reviews.Count(r => r.OverallRating == 5),
                    FourStarCount = reviews.Count(r => r.OverallRating == 4),
                    ThreeStarCount = reviews.Count(r => r.OverallRating == 3),
                    TwoStarCount = reviews.Count(r => r.OverallRating == 2),
                    OneStarCount = reviews.Count(r => r.OverallRating == 1),
                    RecentReviews = await GetRecentReviewsAsync(hotelId, propertyId, roomTypeId)
                };

            return summary;
        }

        public async Task<List<ReviewResponseDto>> GetPendingReviewsAsync(int page = 1, int pageSize = 10)
        {
            var reviews = await _context.Reviews
                .Where(r => r.Status == ReviewStatus.Pending)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .Include(r => r.User)
                .OrderBy(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                HotelName = r.Hotel?.Name ?? "",
                PropertyId = r.PropertyId,
                PropertyTitle = r.Property?.Title,
                RoomTypeId = r.RoomTypeId,
                RoomTypeName = r.RoomType?.Name,
                UserId = r.UserId,
                UserEmail = r.User?.Email ?? "",
                ReservationId = r.ReservationId,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                ServiceRating = r.ServiceRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status.ToString()
            }).ToList();
        }

        public async Task<List<ReviewResponseDto>> GetFilteredReviewsAsync(ReviewFilterDto filterDto)
        {
            var query = _context.Reviews.AsQueryable();

            if (filterDto.HotelId.HasValue)
                query = query.Where(r => r.HotelId == filterDto.HotelId.Value);
            if (filterDto.PropertyId.HasValue)
                query = query.Where(r => r.PropertyId == filterDto.PropertyId.Value);
            if (filterDto.RoomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == filterDto.RoomTypeId.Value);
            if (filterDto.MinRating.HasValue)
                query = query.Where(r => r.OverallRating >= filterDto.MinRating.Value);
            if (filterDto.MaxRating.HasValue)
                query = query.Where(r => r.OverallRating <= filterDto.MaxRating.Value);
            if (!string.IsNullOrEmpty(filterDto.Status))
                query = query.Where(r => r.Status.ToString() == filterDto.Status);
            if (filterDto.DateFrom.HasValue)
                query = query.Where(r => r.CreatedAt >= filterDto.DateFrom.Value);
            if (filterDto.DateTo.HasValue)
                query = query.Where(r => r.CreatedAt <= filterDto.DateTo.Value);

            var reviews = await query
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((filterDto.Page - 1) * filterDto.PageSize)
                .Take(filterDto.PageSize)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                HotelName = r.Hotel?.Name ?? "",
                PropertyId = r.PropertyId,
                PropertyTitle = r.Property?.Title,
                RoomTypeId = r.RoomTypeId,
                RoomTypeName = r.RoomType?.Name,
                UserId = r.UserId,
                UserEmail = r.User?.Email ?? "",
                ReservationId = r.ReservationId,
                OverallRating = r.OverallRating,
                CleanlinessRating = r.CleanlinessRating,
                ServiceRating = r.ServiceRating,
                LocationRating = r.LocationRating,
                ValueRating = r.ValueRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status.ToString()
            }).ToList();
        }

        public async Task UpdateAverageRatingsAsync(int hotelId, int? propertyId = null, int? roomTypeId = null)
        {
            // Hotel için ortalama puanları güncelle
            var hotelReviews = await _context.Reviews
                .Where(r => r.HotelId == hotelId && r.Status == ReviewStatus.Approved)
                .ToListAsync();

            if (hotelReviews.Any())
            {
                var hotel = await _context.Hotels.FindAsync(hotelId);
                if (hotel != null)
                {
                    hotel.AverageOverallRating = (decimal)Math.Round(hotelReviews.Average(r => r.OverallRating), 1);
                    hotel.AverageCleanlinessRating = (decimal)Math.Round(hotelReviews.Average(r => r.CleanlinessRating), 1);
                    hotel.AverageServiceRating = (decimal)Math.Round(hotelReviews.Average(r => r.ServiceRating), 1);
                    hotel.AverageLocationRating = (decimal)Math.Round(hotelReviews.Average(r => r.LocationRating), 1);
                    hotel.AverageValueRating = (decimal)Math.Round(hotelReviews.Average(r => r.ValueRating), 1);
                    hotel.TotalReviews = hotelReviews.Count;
                }
            }

            // Property için ortalama puanları güncelle
            if (propertyId.HasValue)
            {
                var propertyReviews = await _context.Reviews
                    .Where(r => r.PropertyId == propertyId.Value && r.Status == ReviewStatus.Approved)
                    .ToListAsync();

                if (propertyReviews.Any())
                {
                    var property = await _context.Properties.FindAsync(propertyId.Value);
                                    if (property != null)
                {
                    property.AverageOverallRating = (decimal)Math.Round(propertyReviews.Average(r => r.OverallRating), 1);
                    property.AverageCleanlinessRating = (decimal)Math.Round(propertyReviews.Average(r => r.CleanlinessRating), 1);
                    property.AverageServiceRating = (decimal)Math.Round(propertyReviews.Average(r => r.ServiceRating), 1);
                    property.AverageLocationRating = (decimal)Math.Round(propertyReviews.Average(r => r.LocationRating), 1);
                    property.AverageValueRating = (decimal)Math.Round(propertyReviews.Average(r => r.ValueRating), 1);
                    property.TotalReviews = propertyReviews.Count;
                }
                }
            }

            // RoomType için ortalama puanları güncelle
            if (roomTypeId.HasValue)
            {
                var roomTypeReviews = await _context.Reviews
                    .Where(r => r.RoomTypeId == roomTypeId.Value && r.Status == ReviewStatus.Approved)
                    .ToListAsync();

                if (roomTypeReviews.Any())
                {
                    var roomType = await _context.RoomTypes.FindAsync(roomTypeId.Value);
                                    if (roomType != null)
                {
                    roomType.AverageOverallRating = (decimal)Math.Round(roomTypeReviews.Average(r => r.OverallRating), 1);
                    roomType.AverageCleanlinessRating = (decimal)Math.Round(roomTypeReviews.Average(r => r.CleanlinessRating), 1);
                    roomType.AverageServiceRating = (decimal)Math.Round(roomTypeReviews.Average(r => r.ServiceRating), 1);
                    roomType.AverageLocationRating = (decimal)Math.Round(roomTypeReviews.Average(r => r.LocationRating), 1);
                    roomType.AverageValueRating = (decimal)Math.Round(roomTypeReviews.Average(r => r.ValueRating), 1);
                    roomType.TotalReviews = roomTypeReviews.Count;
                }
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task<List<ReviewResponseDto>> GetRecentReviewsAsync(int? hotelId = null, int? propertyId = null, int? roomTypeId = null)
        {
            var query = _context.Reviews.Where(r => r.Status == ReviewStatus.Approved);

            if (hotelId.HasValue)
                query = query.Where(r => r.HotelId == hotelId.Value);
            if (propertyId.HasValue)
                query = query.Where(r => r.PropertyId == propertyId.Value);
            if (roomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);

            var recentReviews = await query
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .ToListAsync();

            return recentReviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserEmail = r.User?.Email ?? "",
                OverallRating = r.OverallRating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
    }
}
