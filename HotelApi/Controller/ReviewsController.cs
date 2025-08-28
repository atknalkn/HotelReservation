using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HotelApi.Services;
using HotelApi.DTOs;

namespace HotelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        // GET: api/reviews/hotel/{hotelId} - Otel için yorumları getir
        [HttpGet("hotel/{hotelId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetReviewsByHotel(
            int hotelId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1 || pageSize < 1 || pageSize > 50)
                    return BadRequest("Geçersiz sayfa parametreleri");

                var reviews = await _reviewService.GetReviewsByHotelAsync(hotelId, page, pageSize);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for hotel {HotelId}", hotelId);
                return StatusCode(500, "Yorumlar alınamadı");
            }
        }

        // GET: api/reviews/property/{propertyId} - Property için yorumları getir
        [HttpGet("property/{propertyId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetReviewsByProperty(
            int propertyId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1 || pageSize < 1 || pageSize > 50)
                    return BadRequest("Geçersiz sayfa parametreleri");

                var reviews = await _reviewService.GetReviewsByPropertyAsync(propertyId, page, pageSize);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for property {PropertyId}", propertyId);
                return StatusCode(500, "Yorumlar alınamadı");
            }
        }

        // GET: api/reviews/roomtype/{roomTypeId} - Oda tipi için yorumları getir
        [HttpGet("roomtype/{roomTypeId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetReviewsByRoomType(
            int roomTypeId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1 || pageSize < 1 || pageSize > 50)
                    return BadRequest("Geçersiz sayfa parametreleri");

                var reviews = await _reviewService.GetReviewsByRoomTypeAsync(roomTypeId, page, pageSize);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for room type {RoomTypeId}", roomTypeId);
                return StatusCode(500, "Yorumlar alınamadı");
            }
        }

        // GET: api/reviews/summary/hotel/{hotelId} - Otel için yorum özeti
        [HttpGet("summary/hotel/{hotelId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewSummaryDto>> GetHotelReviewSummary(int hotelId)
        {
            try
            {
                var summary = await _reviewService.GetReviewSummaryAsync(hotelId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for hotel {HotelId}", hotelId);
                return StatusCode(500, "Yorum özeti alınamadı");
            }
        }

        // GET: api/reviews/summary/property/{propertyId} - Property için yorum özeti
        [HttpGet("summary/property/{propertyId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewSummaryDto>> GetPropertyReviewSummary(int propertyId)
        {
            try
            {
                var summary = await _reviewService.GetReviewSummaryAsync(null, propertyId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for property {PropertyId}", propertyId);
                return StatusCode(500, "Yorum özeti alınamadı");
            }
        }

        // GET: api/reviews/summary/roomtype/{roomTypeId} - Oda tipi için yorum özeti
        [HttpGet("summary/roomtype/{roomTypeId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewSummaryDto>> GetRoomTypeReviewSummary(int roomTypeId)
        {
            try
            {
                var summary = await _reviewService.GetReviewSummaryAsync(null, null, roomTypeId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for room type {RoomTypeId}", roomTypeId);
                return StatusCode(500, "Yorum özeti alınamadı");
            }
        }

        // POST: api/reviews - Yeni yorum oluştur
        [HttpPost]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult<ReviewResponseDto>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            try
            {
                // User ID'yi JWT token'dan al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized();
                }

                var review = await _reviewService.CreateReviewAsync(createReviewDto, userId);
                return CreatedAtAction(nameof(GetReviewById), new { id = review.Id }, review);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, "Yorum oluşturulamadı");
            }
        }

        // GET: api/reviews/{id} - Belirli yorumu getir
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewResponseDto>> GetReviewById(int id)
        {
            try
            {
                var review = await _reviewService.GetReviewByIdAsync(id);
                if (review == null)
                    return NotFound();

                return Ok(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review {ReviewId}", id);
                return StatusCode(500, "Yorum alınamadı");
            }
        }

        // GET: api/reviews/user/{userId} - Kullanıcının yorumlarını getir
        [HttpGet("user/{userId}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetUserReviews(
            int userId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                // Sadece kendi yorumlarını görebilir
                var currentUserIdClaim = HttpContext.User.FindFirst("UserId");
                if (currentUserIdClaim == null || !int.TryParse(currentUserIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                if (currentUserId != userId)
                    return Forbid();

                if (page < 1 || pageSize < 1 || pageSize > 50)
                    return BadRequest("Geçersiz sayfa parametreleri");

                var reviews = await _reviewService.GetReviewsByUserAsync(userId, page, pageSize);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for user {UserId}", userId);
                return StatusCode(500, "Yorumlar alınamadı");
            }
        }

        // PUT: api/reviews/{id} - Yorumu güncelle
        [HttpPut("{id}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult<ReviewResponseDto>> UpdateReview(int id, [FromBody] ReviewUpdateDto updateDto)
        {
            try
            {
                // User ID'yi JWT token'dan al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized();
                }

                var review = await _reviewService.UpdateReviewAsync(id, updateDto, userId);
                return Ok(review);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review {ReviewId}", id);
                return StatusCode(500, "Yorum güncellenemedi");
            }
        }

        // DELETE: api/reviews/{id} - Yorumu sil
        [HttpDelete("{id}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                // User ID'yi JWT token'dan al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized();
                }

                var result = await _reviewService.DeleteReviewAsync(id, userId);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId}", id);
                return StatusCode(500, "Yorum silinemedi");
            }
        }

        // ========== ADMIN ENDPOINTS ==========

        // GET: api/reviews/pending - Onay bekleyen yorumları getir
        [HttpGet("pending")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetPendingReviews(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1 || pageSize < 1 || pageSize > 50)
                    return BadRequest("Geçersiz sayfa parametreleri");

                var reviews = await _reviewService.GetPendingReviewsAsync(page, pageSize);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending reviews");
                return StatusCode(500, "Bekleyen yorumlar alınamadı");
            }
        }

        // POST: api/reviews/{id}/approve - Yorumu onayla
        [HttpPost("{id}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<ReviewResponseDto>> ApproveReview(int id, [FromBody] ReviewApprovalDto approvalDto)
        {
            try
            {
                // Admin user ID'yi JWT token'dan al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int adminUserId))
                {
                    return Unauthorized();
                }

                var review = await _reviewService.ApproveReviewAsync(id, approvalDto, adminUserId);
                return Ok(review);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving review {ReviewId}", id);
                return StatusCode(500, "Yorum onaylanamadı");
            }
        }

        // POST: api/reviews/{id}/reject - Yorumu reddet
        [HttpPost("{id}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<ReviewResponseDto>> RejectReview(int id, [FromBody] ReviewRejectionDto rejectionDto)
        {
            try
            {
                // Admin user ID'yi JWT token'dan al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int adminUserId))
                {
                    return Unauthorized();
                }

                var review = await _reviewService.RejectReviewAsync(id, rejectionDto, adminUserId);
                return Ok(review);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting review {ReviewId}", id);
                return StatusCode(500, "Yorum reddedilemedi");
            }
        }

        // GET: api/reviews/filtered - Filtrelenmiş yorumları getir
        [HttpGet("filtered")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetFilteredReviews([FromQuery] ReviewFilterDto filterDto)
        {
            try
            {
                if (filterDto.Page < 1 || filterDto.PageSize < 1 || filterDto.PageSize > 100)
                    return BadRequest("Geçersiz sayfa parametreleri");

                var reviews = await _reviewService.GetFilteredReviewsAsync(filterDto);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered reviews");
                return StatusCode(500, "Filtrelenmiş yorumlar alınamadı");
            }
        }
    }
}
