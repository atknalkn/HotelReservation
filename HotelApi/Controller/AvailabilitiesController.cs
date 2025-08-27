using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;

namespace HotelApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvailabilitiesController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public AvailabilitiesController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/Availabilities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Availability>>> GetAvailabilities()
        {
            return await _context.Availabilities
                .Include(a => a.RoomType)
                .ToListAsync();
        }

        // GET: api/Availabilities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Availability>> GetAvailability(int id)
        {
            var availability = await _context.Availabilities
                .Include(a => a.RoomType)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (availability == null)
            {
                return NotFound();
            }

            return availability;
        }

        // GET: api/Availabilities/roomtype/5
        [HttpGet("roomtype/{roomTypeId}")]
        public async Task<ActionResult<IEnumerable<Availability>>> GetAvailabilitiesByRoomType(int roomTypeId)
        {
            var availabilities = await _context.Availabilities
                .Where(a => a.RoomTypeId == roomTypeId)
                .OrderBy(a => a.Date)
                .ToListAsync();

            return availabilities;
        }

        // GET: api/Availabilities/roomtype/5/date/2025-08-27
        [HttpGet("roomtype/{roomTypeId}/date/{date:datetime}")]
        public async Task<ActionResult<Availability>> GetAvailabilityByRoomTypeAndDate(int roomTypeId, DateTime date)
        {
            var availability = await _context.Availabilities
                .FirstOrDefaultAsync(a => a.RoomTypeId == roomTypeId && a.Date.Date == date.Date);

            if (availability == null)
            {
                return NotFound();
            }

            return availability;
        }

        // POST: api/Availabilities
        [HttpPost]
        public async Task<ActionResult<AvailabilityResponseDto>> PostAvailability(AvailabilityDto availabilityDto)
        {
            // RoomType'ın var olup olmadığını kontrol et
            var roomType = await _context.RoomTypes.FindAsync(availabilityDto.RoomTypeId);
            if (roomType == null)
            {
                return BadRequest("RoomType bulunamadı");
            }

            // Aynı RoomType için aynı tarihte Availability var mı kontrol et
            var existingAvailability = await _context.Availabilities
                .FirstOrDefaultAsync(a => a.RoomTypeId == availabilityDto.RoomTypeId && a.Date.Date == availabilityDto.Date.Date);
            
            if (existingAvailability != null)
            {
                return BadRequest("Bu RoomType için bu tarihte zaten Availability kaydı mevcut");
            }

            var availability = new Availability
            {
                RoomTypeId = availabilityDto.RoomTypeId,
                Date = availabilityDto.Date.Date, // Sadece tarih kısmını al, time zone sorununu önle
                Stock = availabilityDto.Stock,
                PriceOverride = availabilityDto.PriceOverride
            };

            _context.Availabilities.Add(availability);
            await _context.SaveChangesAsync();

            // Response DTO oluştur
            var responseDto = new AvailabilityResponseDto
            {
                Id = availability.Id,
                RoomTypeId = availability.RoomTypeId,
                RoomTypeName = roomType.Name,
                Date = availability.Date,
                Stock = availability.Stock,
                PriceOverride = availability.PriceOverride,
                EffectivePrice = availability.PriceOverride ?? roomType.BasePrice
            };

            return CreatedAtAction(nameof(GetAvailability), new { id = availability.Id }, responseDto);
        }

        // PUT: api/Availabilities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAvailability(int id, AvailabilityDto availabilityDto)
        {
            var availability = await _context.Availabilities.FindAsync(id);
            if (availability == null)
            {
                return NotFound();
            }

            // RoomType'ın var olup olmadığını kontrol et
            var roomType = await _context.RoomTypes.FindAsync(availabilityDto.RoomTypeId);
            if (roomType == null)
            {
                return BadRequest("RoomType bulunamadı");
            }

            // Aynı RoomType için aynı tarihte başka Availability var mı kontrol et (kendisi hariç)
            var existingAvailability = await _context.Availabilities
                .FirstOrDefaultAsync(a => a.RoomTypeId == availabilityDto.RoomTypeId && 
                                        a.Date.Date == availabilityDto.Date.Date && 
                                        a.Id != id);
            
            if (existingAvailability != null)
            {
                return BadRequest("Bu RoomType için bu tarihte zaten başka bir Availability kaydı mevcut");
            }

            availability.RoomTypeId = availabilityDto.RoomTypeId;
            availability.Date = availabilityDto.Date.Date;
            availability.Stock = availabilityDto.Stock;
            availability.PriceOverride = availabilityDto.PriceOverride;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AvailabilityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Availabilities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvailability(int id)
        {
            var availability = await _context.Availabilities.FindAsync(id);
            if (availability == null)
            {
                return NotFound();
            }

            _context.Availabilities.Remove(availability);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AvailabilityExists(int id)
        {
            return _context.Availabilities.Any(e => e.Id == id);
        }
    }
}
