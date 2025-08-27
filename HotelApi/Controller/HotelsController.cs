using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> GetById(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.OwnerUser)
                .FirstOrDefaultAsync(h => h.Id == id);

            return hotel is null ? NotFound() : Ok(hotel);
        }

        // POST: api/hotels
        [HttpPost]
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
                Status = hotelDto.Status,
                StarRating = hotelDto.StarRating
            };

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = hotel.Id }, hotel);
        }

        // PUT: api/hotels/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] HotelDto hotelDto)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel is null) return NotFound();

            // Alanları güncelle
            hotel.OwnerUserId = hotelDto.OwnerUserId;
            hotel.Name = hotelDto.Name;
            hotel.City = hotelDto.City;
            hotel.Address = hotelDto.Address;
            hotel.TaxNo = hotelDto.TaxNo;
            hotel.Status = hotelDto.Status;
            hotel.StarRating = hotelDto.StarRating;

            await _context.SaveChangesAsync();
            return Ok(hotel);
        }

        // DELETE: api/hotels/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel is null) return NotFound();

            _context.Hotels.Remove(hotel);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
