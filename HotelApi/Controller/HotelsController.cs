using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HotelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        public HotelsController(HotelDbContext context) => _context = context;

        // GET: api/hotels
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] string? city, [FromQuery] HotelStatus? status)
        {
            var q = _context.Hotels.AsQueryable();

            if (!string.IsNullOrWhiteSpace(city))
                q = q.Where(h => h.City.ToLower().Contains(city.ToLower()));

            if (status.HasValue)
                q = q.Where(h => h.Status == status.Value);

            var list = await q
                .Include(h => h.OwnerUser) // İstersen kaldır
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/hotels/1
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.OwnerUser)
                .FirstOrDefaultAsync(h => h.Id == id);

            return hotel is null ? NotFound() : Ok(hotel);
        }

        // POST: api/hotels
        [HttpPost]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> Create([FromBody] HotelDto hotelDto)
        {
            // Basit doğrulamalar
            if (string.IsNullOrWhiteSpace(hotelDto.Name))
                return BadRequest("Name is required.");
            if (hotelDto.OwnerUserId <= 0 || !_context.Users.Any(u => u.Id == hotelDto.OwnerUserId))
                return BadRequest("OwnerUserId must be a valid existing user.");

            var hotel = new Hotel
            {
                OwnerUserId = hotelDto.OwnerUserId,
                Name = hotelDto.Name,
                City = hotelDto.City,
                Address = hotelDto.Address,
                TaxNo = hotelDto.TaxNo,
                Status = HotelStatus.Pending, // Yeni oteller her zaman pending olarak başlar
                StarRating = hotelDto.StarRating
            };

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = hotel.Id }, hotel);
        }

        // PUT: api/hotels/1
        [HttpPut("{id:int}")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] HotelDto hotelDto)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel is null) return NotFound();

            // Sadece onaylanmış oteller güncellenebilir
            if (hotel.Status != HotelStatus.Approved)
                return BadRequest("Only approved hotels can be updated.");

            // Alanları güncelle
            hotel.OwnerUserId = hotelDto.OwnerUserId;
            hotel.Name = hotelDto.Name;
            hotel.City = hotelDto.City;
            hotel.Address = hotelDto.Address;
            hotel.TaxNo = hotelDto.TaxNo;
            hotel.StarRating = hotelDto.StarRating;
            // Status admin tarafından yönetilir, burada değiştirilemez

            await _context.SaveChangesAsync();
            return Ok(hotel);
        }

        // DELETE: api/hotels/1
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel is null) return NotFound();

            // Sadece onaylanmamış oteller silinebilir
            if (hotel.Status == HotelStatus.Approved)
                return BadRequest("Approved hotels cannot be deleted. Contact admin for assistance.");

            _context.Hotels.Remove(hotel);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ========== ADMIN ENDPOINTS ==========

        // GET: api/hotels/pending - Admin: Onay bekleyen otelleri listele
        [HttpGet("pending")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPendingHotels()
        {
            var pendingHotels = await _context.Hotels
                .Where(h => h.Status == HotelStatus.Pending)
                .Include(h => h.OwnerUser)
                .OrderBy(h => h.CreatedAt) // En eski başvurular önce
                .ToListAsync();

            return Ok(pendingHotels);
        }

        // GET: api/hotels/status/{status} - Admin: Belirli durumdaki otelleri listele
        [HttpGet("status/{status}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetHotelsByStatus(HotelStatus status)
        {
            var hotels = await _context.Hotels
                .Where(h => h.Status == status)
                .Include(h => h.OwnerUser)
                .OrderBy(h => h.CreatedAt)
                .ToListAsync();

            return Ok(hotels);
        }

        // POST: api/hotels/{id}/approve - Admin: Oteli onayla
        [HttpPost("{id:int}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Approve(int id, [FromBody] HotelApprovalDto? approvalDto = null)
        {
            var hotel = await _context.Hotels
                .Include(h => h.OwnerUser)
                .FirstOrDefaultAsync(h => h.Id == id);
            
            if (hotel is null) return NotFound();

            if (hotel.Status != HotelStatus.Pending)
                return BadRequest($"Hotel is already {hotel.Status.ToString().ToLower()}. Cannot change status.");

            hotel.Status = HotelStatus.Approved;
            
            // Eğer admin not eklemek isterse
            if (approvalDto?.AdminNotes != null)
            {
                // Burada admin notlarını kaydetmek için yeni bir alan eklenebilir
                // Şimdilik sadece status'u değiştiriyoruz
            }

            await _context.SaveChangesAsync();
            
            return Ok(new { 
                id = hotel.Id, 
                name = hotel.Name,
                status = hotel.Status.ToString(),
                message = "Hotel approved successfully",
                approvedAt = DateTime.UtcNow
            });
        }

        // POST: api/hotels/{id}/reject - Admin: Oteli reddet
        [HttpPost("{id:int}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Reject(int id, [FromBody] HotelRejectionDto rejectionDto)
        {
            if (string.IsNullOrWhiteSpace(rejectionDto.Reason))
                return BadRequest("Rejection reason is required.");

            var hotel = await _context.Hotels
                .Include(h => h.OwnerUser)
                .FirstOrDefaultAsync(h => h.Id == id);
            
            if (hotel is null) return NotFound();

            if (hotel.Status != HotelStatus.Pending)
                return BadRequest($"Hotel is already {hotel.Status.ToString().ToLower()}. Cannot change status.");

            hotel.Status = HotelStatus.Rejected;
            
            // Red sebebi kaydedilebilir (şimdilik sadece status değişiyor)
            // Burada admin notlarını kaydetmek için yeni bir alan eklenebilir

            await _context.SaveChangesAsync();
            
            return Ok(new { 
                id = hotel.Id, 
                name = hotel.Name,
                status = hotel.Status.ToString(),
                reason = rejectionDto.Reason,
                message = "Hotel rejected",
                rejectedAt = DateTime.UtcNow
            });
        }

        // GET: api/hotels/statistics - Admin: Otel istatistiklerini görüntüle
        [HttpGet("statistics")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetHotelStatistics()
        {
            var totalHotels = await _context.Hotels.CountAsync();
            var pendingHotels = await _context.Hotels.CountAsync(h => h.Status == HotelStatus.Pending);
            var approvedHotels = await _context.Hotels.CountAsync(h => h.Status == HotelStatus.Approved);
            var rejectedHotels = await _context.Hotels.CountAsync(h => h.Status == HotelStatus.Rejected);

            var cityStats = await _context.Hotels
                .GroupBy(h => h.City)
                .Select(g => new { City = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                totalHotels,
                pendingHotels,
                approvedHotels,
                rejectedHotels,
                topCities = cityStats,
                generatedAt = DateTime.UtcNow
            });
        }
    }
}
