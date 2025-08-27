using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypes()
        {
            return await _context.RoomTypes
                .Include(rt => rt.Property)
                .ToListAsync();
        }

        // GET: api/RoomTypes/5
        [HttpGet("{id}")]
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
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypesByProperty(int propertyId)
        {
            var roomTypes = await _context.RoomTypes
                .Where(rt => rt.PropertyId == propertyId)
                .ToListAsync();

            return roomTypes;
        }

        // POST: api/RoomTypes
        [HttpPost]
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
        public async Task<IActionResult> PutRoomType(int id, RoomTypeDto roomTypeDto)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }

            // Property'nin var olup olmadığını kontrol et
            var property = await _context.Properties.FindAsync(roomTypeDto.PropertyId);
            if (property == null)
            {
                return BadRequest("Property bulunamadı");
            }

            // Aynı Property'de aynı isimde başka RoomType var mı kontrol et
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

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomTypeExists(id))
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

        // DELETE: api/RoomTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }

            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomTypeExists(int id)
        {
            return _context.RoomTypes.Any(e => e.Id == id);
        }
    }
}
