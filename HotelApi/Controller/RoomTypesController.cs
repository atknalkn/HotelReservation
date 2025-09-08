using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HotelApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public RoomTypesController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/RoomTypes
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypes()
        {
            return await _context.RoomTypes
                .Include(rt => rt.Property)
                .ToListAsync();
        }

        // GET: api/RoomTypes/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<RoomType>> GetRoomType(int id)
        {
            var roomType = await _context.RoomTypes
                .Include(rt => rt.Property)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
            {
                return NotFound();
            }

            return roomType;
        }

        // GET: api/RoomTypes/ByProperty/5
        [HttpGet("ByProperty/{propertyId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypesByProperty(int propertyId)
        {
            var roomTypes = await _context.RoomTypes
                .Where(rt => rt.PropertyId == propertyId)
                .ToListAsync();

            return roomTypes;
        }

        // POST: api/RoomTypes
        [HttpPost]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<ActionResult<RoomType>> PostRoomType(RoomTypeDto roomTypeDto)
        {
            // Property'nin var olup olmadığını kontrol et
            var property = await _context.Properties.FindAsync(roomTypeDto.PropertyId);
            if (property == null)
            {
                return BadRequest("Property bulunamadı");
            }

            // Aynı Property'de aynı isimde RoomType var mı kontrol et
            var existingRoomType = await _context.RoomTypes
                .FirstOrDefaultAsync(rt => rt.PropertyId == roomTypeDto.PropertyId && rt.Name == roomTypeDto.Name);
            
            if (existingRoomType != null)
            {
                return BadRequest("Bu Property'de aynı isimde RoomType zaten mevcut");
            }

            var roomType = new RoomType
            {
                PropertyId = roomTypeDto.PropertyId,
                Name = roomTypeDto.Name,
                Capacity = roomTypeDto.Capacity,
                BasePrice = roomTypeDto.BasePrice,
                Description = roomTypeDto.Description
            };

            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoomType), new { id = roomType.Id }, roomType);
        }

        // PUT: api/RoomTypes/5
        [HttpPut("{id}")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> PutRoomType(int id, RoomTypeDto roomTypeDto)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var roomType = await _context.RoomTypes
                    .Include(rt => rt.Property)
                    .ThenInclude(p => p.Hotel)
                    .FirstOrDefaultAsync(rt => rt.Id == id);

                if (roomType == null)
                {
                    return NotFound("Oda tipi bulunamadı");
                }

                // Sadece kendi otelinin oda tipini güncelleyebilir
                if (roomType.Property.Hotel.OwnerUserId != currentUserId)
                {
                    return Forbid("Bu oda tipi size ait değil");
                }

                // Property'nin var olup olmadığını kontrol et
                var property = await _context.Properties.FindAsync(roomTypeDto.PropertyId);
                if (property == null)
                {
                    return BadRequest("Property bulunamadı");
                }

                // Aynı Property'de aynı isimde RoomType var mı kontrol et (kendisi hariç)
                var existingRoomType = await _context.RoomTypes
                    .FirstOrDefaultAsync(rt => rt.PropertyId == roomTypeDto.PropertyId && 
                                             rt.Name == roomTypeDto.Name && 
                                             rt.Id != id);
                
                if (existingRoomType != null)
                {
                    return BadRequest("Bu Property'de aynı isimde RoomType zaten mevcut");
                }

                roomType.PropertyId = roomTypeDto.PropertyId;
                roomType.Name = roomTypeDto.Name;
                roomType.Capacity = roomTypeDto.Capacity;
                roomType.BasePrice = roomTypeDto.BasePrice;
                roomType.Description = roomTypeDto.Description;

                await _context.SaveChangesAsync();

                return Ok(roomType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Oda tipi güncellenirken bir hata oluştu");
            }
        }

        // GET: api/RoomTypes/my-room-types
        [HttpGet("my-room-types")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetMyRoomTypes()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var roomTypes = await _context.RoomTypes
                    .Include(rt => rt.Property)
                    .ThenInclude(p => p.Hotel)
                    .Where(rt => rt.Property.Hotel.OwnerUserId == currentUserId)
                    .OrderByDescending(rt => rt.CreatedAt)
                    .Select(rt => new
                    {
                        rt.Id,
                        rt.Name,
                        rt.Description,
                        rt.Capacity,
                        rt.BasePrice,
                        rt.CreatedAt,
                        PropertyId = rt.Property.Id,
                        PropertyTitle = rt.Property.Title,
                        HotelId = rt.Property.Hotel.Id,
                        HotelName = rt.Property.Hotel.Name
                    })
                    .ToListAsync();

                return Ok(roomTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Oda tipi bilgileri alınırken bir hata oluştu");
            }
        }

        // DELETE: api/RoomTypes/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var roomType = await _context.RoomTypes
                    .Include(rt => rt.Property)
                    .ThenInclude(p => p.Hotel)
                    .FirstOrDefaultAsync(rt => rt.Id == id);

                if (roomType == null)
                {
                    return NotFound("Oda tipi bulunamadı");
                }

                // Sadece kendi otelinin oda tipini silebilir
                if (roomType.Property.Hotel.OwnerUserId != currentUserId)
                {
                    return Forbid("Bu oda tipi size ait değil");
                }

                // Rezervasyon kontrolü
                var hasReservations = await _context.Reservations
                    .AnyAsync(r => r.RoomTypeId == id);

                if (hasReservations)
                {
                    return BadRequest("Bu oda tipinde rezervasyon bulunduğu için silinemez");
                }

                _context.RoomTypes.Remove(roomType);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Oda tipi silinirken bir hata oluştu");
            }
        }

        private bool RoomTypeExists(int id)
        {
            return _context.RoomTypes.Any(e => e.Id == id);
        }
    }
}
