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
    public class PropertiesController : ControllerBase
    {
        private readonly HotelDbContext _context;
        public PropertiesController(HotelDbContext context) => _context = context;

        // GET: api/properties
        // Filtreler: ?hotelId=1&city=Ankara
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] int? hotelId, [FromQuery] string? city)
        {
            var q = _context.Properties.AsQueryable();

            if (hotelId.HasValue)
                q = q.Where(p => p.HotelId == hotelId.Value);

            if (!string.IsNullOrWhiteSpace(city))
                q = q.Where(p => p.City.ToLower().Contains(city.ToLower()));

            var list = await q
                .Include(p => p.Hotel)   // istersen kaldır
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/properties/5
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var prop = await _context.Properties
                .Include(p => p.Hotel)
                .FirstOrDefaultAsync(p => p.Id == id);

            return prop is null ? NotFound() : Ok(prop);
        }

        // POST: api/properties
        [HttpPost]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> Create([FromBody] PropertyDto propertyDto)
        {
            // Basit doğrulamalar
            if (propertyDto.HotelId <= 0 || !_context.Hotels.Any(h => h.Id == propertyDto.HotelId))
                return BadRequest("HotelId must refer to an existing hotel.");

            if (string.IsNullOrWhiteSpace(propertyDto.Title))
                return BadRequest("Title is required.");

            var property = new Property
            {
                HotelId = propertyDto.HotelId,
                Title = propertyDto.Title,
                Description = propertyDto.Description,
                City = propertyDto.City,
                Address = propertyDto.Address,
                Stars = propertyDto.Stars,
                Location = propertyDto.Location
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = property.Id }, property);
        }

        // PUT: api/properties/5
        [HttpPut("{id:int}")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] PropertyDto propertyDto)
        {
            var prop = await _context.Properties.FindAsync(id);
            if (prop is null) return NotFound();

            // Hotel değişimi serbest mi? Serbest olsun ama FK kontrolü yapalım
            if (propertyDto.HotelId <= 0 || !_context.Hotels.Any(h => h.Id == propertyDto.HotelId))
                return BadRequest("HotelId must refer to an existing hotel.");

            prop.HotelId = propertyDto.HotelId;
            prop.Title = propertyDto.Title;
            prop.Description = propertyDto.Description;
            prop.City = prop.City;
            prop.Address = propertyDto.Address;
            prop.Stars = propertyDto.Stars;
            prop.Location = propertyDto.Location;

            await _context.SaveChangesAsync();
            return Ok(prop);
        }

        // GET: api/properties/my-properties
        [HttpGet("my-properties")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> GetMyProperties()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var properties = await _context.Properties
                    .Include(p => p.Hotel)
                    .Where(p => p.Hotel.OwnerUserId == currentUserId)
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new
                    {
                        p.Id,
                        p.Title,
                        p.Description,
                        p.City,
                        p.Address,
                        p.Stars,
                        p.Location,
                        p.CreatedAt,
                        HotelId = p.Hotel.Id,
                        HotelName = p.Hotel.Name
                    })
                    .ToListAsync();

                return Ok(properties);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Tesis bilgileri alınırken bir hata oluştu");
            }
        }

        // DELETE: api/properties/5
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "HotelOwnerOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
                {
                    return Unauthorized();
                }

                var property = await _context.Properties
                    .Include(p => p.Hotel)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (property == null)
                {
                    return NotFound("Tesis bulunamadı");
                }

                // Sadece kendi otelinin tesisini silebilir
                if (property.Hotel.OwnerUserId != currentUserId)
                {
                    return Forbid("Bu tesis size ait değil");
                }

                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Tesis silinirken bir hata oluştu");
            }
        }


    }
}
