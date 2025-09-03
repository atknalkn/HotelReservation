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
        public async Task<IActionResult> GetAll(
            [FromQuery] string? city, 
            [FromQuery] HotelStatus? status,
            [FromQuery] DateTime? checkIn,
            [FromQuery] DateTime? checkOut,
            [FromQuery] int guests = 1,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int? minStars = null,
            [FromQuery] string? sortBy = "rating",
            [FromQuery] string? sortOrder = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var q = _context.Hotels.AsQueryable();

            // Sadece onaylanmış otelleri göster (güvenlik için)
            q = q.Where(h => h.Status == HotelStatus.Approved);

            // Şehir filtresi
            if (!string.IsNullOrWhiteSpace(city))
                q = q.Where(h => h.City.ToLower().Contains(city.ToLower()));

            // Yıldız filtresi
            if (minStars.HasValue)
                q = q.Where(h => h.StarRating >= minStars.Value);

            // Müsaitlik kontrolü (tarih ve kişi sayısı) - Sadece tarih seçilmişse
            if (checkIn.HasValue && checkOut.HasValue)
            {
                // Availability verisi olan oteller için müsaitlik kontrolü yap
                var hotelsWithAvailability = await _context.Availabilities
                    .Where(a => a.Date >= checkIn.Value && a.Date < checkOut.Value && a.Stock >= guests)
                    .Select(a => a.RoomType.Property.HotelId)
                    .Distinct()
                    .ToListAsync();

                // Availability verisi olmayan otelleri de dahil et
                var hotelsWithoutAvailability = await _context.Hotels
                    .Where(h => !_context.Availabilities.Any(a => a.RoomType.Property.HotelId == h.Id))
                    .Select(h => h.Id)
                    .ToListAsync();

                var availableHotelIds = hotelsWithAvailability.Union(hotelsWithoutAvailability).ToList();
                q = q.Where(h => availableHotelIds.Contains(h.Id));
            }

            // Fiyat filtresi için önce ortalama fiyatları hesapla
            var hotelsWithPrices = new List<dynamic>();
            var hotels = await q.Include(h => h.OwnerUser).ToListAsync();

            foreach (var hotel in hotels)
            {
                // Entity Framework uyumlu sorgu
                var availabilities = await _context.Availabilities
                    .Where(a => a.RoomType.Property.HotelId == hotel.Id)
                    .Select(a => new { 
                        PriceOverride = a.PriceOverride, 
                        BasePrice = a.RoomType.BasePrice 
                    })
                    .ToListAsync();
                
                var prices = availabilities.Select(a => a.PriceOverride ?? a.BasePrice).ToList();
                var averagePrice = prices.Any() ? prices.Average() : 0;
                
                hotel.AveragePrice = averagePrice > 0 ? (decimal)averagePrice : null;

                // Fiyat filtresi
                if (minPrice.HasValue && hotel.AveragePrice.HasValue && hotel.AveragePrice < minPrice.Value)
                    continue;
                if (maxPrice.HasValue && hotel.AveragePrice.HasValue && hotel.AveragePrice > maxPrice.Value)
                    continue;

                hotelsWithPrices.Add(hotel);
            }

            // Sıralama
            var sortedHotels = sortBy.ToLower() switch
            {
                "price" => sortOrder.ToLower() == "asc" 
                    ? hotelsWithPrices.OrderBy(h => ((Hotel)h).AveragePrice ?? decimal.MaxValue)
                    : hotelsWithPrices.OrderByDescending(h => ((Hotel)h).AveragePrice ?? 0),
                "stars" => sortOrder.ToLower() == "asc"
                    ? hotelsWithPrices.OrderBy(h => ((Hotel)h).StarRating)
                    : hotelsWithPrices.OrderByDescending(h => ((Hotel)h).StarRating),
                "name" => sortOrder.ToLower() == "asc"
                    ? hotelsWithPrices.OrderBy(h => ((Hotel)h).Name)
                    : hotelsWithPrices.OrderByDescending(h => ((Hotel)h).Name),
                "rating" => sortOrder.ToLower() == "asc"
                    ? hotelsWithPrices.OrderBy(h => ((Hotel)h).AverageOverallRating)
                    : hotelsWithPrices.OrderByDescending(h => ((Hotel)h).AverageOverallRating),
                _ => hotelsWithPrices.OrderByDescending(h => ((Hotel)h).AverageOverallRating)
            };

            // Pagination
            var totalCount = sortedHotels.Count();
            var pagedHotels = sortedHotels
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Cast<Hotel>()
                .ToList();

            var result = new
            {
                hotels = pagedHotels,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalCount = totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    hasNext = page * pageSize < totalCount,
                    hasPrevious = page > 1
                }
            };

            return Ok(result);
        }

        // GET: api/hotels/1
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.OwnerUser)
                .FirstOrDefaultAsync(h => h.Id == id && h.Status == HotelStatus.Approved);

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
                StarRating = hotelDto.StarRating,
                Description = hotelDto.Description,
                Phone = hotelDto.Phone,
                Email = hotelDto.Email,
                Website = hotelDto.Website,
                Amenities = hotelDto.Amenities,
                CheckInTime = hotelDto.CheckInTime,
                CheckOutTime = hotelDto.CheckOutTime,
                Policies = hotelDto.Policies
            };

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            // Otel oluşturulduktan sonra otomatik olarak property oluştur
            var property = new Property
            {
                HotelId = hotel.Id,
                Title = hotel.Name,
                Description = hotel.Description,
                City = hotel.City,
                Address = hotel.Address,
                Stars = hotel.StarRating,
                Location = $"{hotel.City}, {hotel.Address}"
            };

            _context.Properties.Add(property);
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

        // GET: api/hotels/my-hotels
        [HttpGet("my-hotels")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> GetMyHotels()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var hotels = await _context.Hotels
                    .Include(h => h.OwnerUser)
                    .Where(h => h.OwnerUserId == currentUserId)
                    .OrderByDescending(h => h.CreatedAt)
                    .ToListAsync();

                return Ok(hotels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Otel bilgileri alınırken bir hata oluştu");
            }
        }

        // GET: api/hotels/{id}/dashboard
        [HttpGet("{id:int}/dashboard")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> GetHotelDashboard(int id)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var hotel = await _context.Hotels
                    .Include(h => h.OwnerUser)
                    .FirstOrDefaultAsync(h => h.Id == id && h.OwnerUserId == currentUserId);

                if (hotel == null)
                {
                    return NotFound("Otel bulunamadı veya bu otel size ait değil");
                }

                // Otel istatistikleri
                var totalProperties = await _context.Properties
                    .Where(p => p.HotelId == id)
                    .CountAsync();

                var totalRoomTypes = await _context.RoomTypes
                    .Where(rt => rt.Property.HotelId == id)
                    .CountAsync();

                var totalReservations = await _context.Reservations
                    .Where(r => r.HotelId == id)
                    .CountAsync();

                var activeReservations = await _context.Reservations
                    .Where(r => r.HotelId == id && (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed))
                    .CountAsync();

                var dashboardData = new
                {
                    Hotel = hotel,
                    Statistics = new
                    {
                        TotalProperties = totalProperties,
                        TotalRoomTypes = totalRoomTypes,
                        TotalReservations = totalReservations,
                        ActiveReservations = activeReservations
                    }
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Dashboard bilgileri alınırken bir hata oluştu");
            }
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

        // POST: api/hotels/create-properties-for-existing-hotels
        [HttpPost("create-properties-for-existing-hotels")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> CreatePropertiesForExistingHotels()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                // Kullanıcının otellerini al
                var hotels = await _context.Hotels
                    .Where(h => h.OwnerUserId == currentUserId)
                    .ToListAsync();

                var createdProperties = new List<Property>();

                foreach (var hotel in hotels)
                {
                    // Bu otel için property var mı kontrol et
                    var existingProperty = await _context.Properties
                        .FirstOrDefaultAsync(p => p.HotelId == hotel.Id);

                    if (existingProperty == null)
                    {
                        // Property oluştur
                        var property = new Property
                        {
                            HotelId = hotel.Id,
                            Title = hotel.Name,
                            Description = hotel.Description,
                            City = hotel.City,
                            Address = hotel.Address,
                            Stars = hotel.StarRating,
                            Location = $"{hotel.City}, {hotel.Address}"
                        };

                        _context.Properties.Add(property);
                        createdProperties.Add(property);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = $"{createdProperties.Count} property oluşturuldu",
                    createdProperties = createdProperties.Select(p => new { p.Id, p.Title, p.HotelId })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Property oluşturulurken bir hata oluştu");
            }
        }
    }
}
