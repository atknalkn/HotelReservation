using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;

namespace HotelApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public ReservationsController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/Reservations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .Select(r => new ReservationResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserEmail = r.User!.Email,
                    HotelId = r.HotelId,
                    HotelName = r.Hotel!.Name,
                    PropertyId = r.PropertyId,
                    PropertyTitle = r.Property!.Title,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType!.Name,
                    CheckIn = r.CheckIn,
                    CheckOut = r.CheckOut,
                    Guests = r.Guests,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status.ToString(),
                    CreatedAt = r.CreatedAt,
                    TotalNights = (r.CheckOut - r.CheckIn).Days
                })
                .ToListAsync();

            return reservations;
        }

        // GET: api/Reservations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservationResponseDto>> GetReservation(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                return NotFound();
            }

            var responseDto = new ReservationResponseDto
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                UserEmail = reservation.User!.Email,
                HotelId = reservation.HotelId,
                HotelName = reservation.Hotel!.Name,
                PropertyId = reservation.PropertyId,
                PropertyTitle = reservation.Property!.Title,
                RoomTypeId = reservation.RoomTypeId,
                RoomTypeName = reservation.RoomType!.Name,
                CheckIn = reservation.CheckIn,
                CheckOut = reservation.CheckOut,
                Guests = reservation.Guests,
                TotalPrice = reservation.TotalPrice,
                Status = reservation.Status.ToString(),
                CreatedAt = reservation.CreatedAt,
                TotalNights = (reservation.CheckOut - reservation.CheckIn).Days
            };

            return responseDto;
        }

        // GET: api/Reservations/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetReservationsByUser(int userId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReservationResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserEmail = r.User!.Email,
                    HotelId = r.HotelId,
                    HotelName = r.Hotel!.Name,
                    PropertyId = r.PropertyId,
                    PropertyTitle = r.Property!.Title,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType!.Name,
                    CheckIn = r.CheckIn,
                    CheckOut = r.CheckOut,
                    Guests = r.Guests,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status.ToString(),
                    CreatedAt = r.CreatedAt,
                    TotalNights = (r.CheckOut - r.CheckIn).Days
                })
                .ToListAsync();

            return reservations;
        }

        // GET: api/Reservations/hotel/5
        [HttpGet("hotel/{hotelId}")]
        public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetReservationsByHotel(int hotelId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Hotel)
                .Include(r => r.Property)
                .Include(r => r.RoomType)
                .Where(r => r.HotelId == hotelId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReservationResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserEmail = r.User!.Email,
                    HotelId = r.HotelId,
                    HotelName = r.Hotel!.Name,
                    PropertyId = r.PropertyId,
                    PropertyTitle = r.Property!.Title,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType!.Name,
                    CheckIn = r.CheckIn,
                    CheckOut = r.CheckOut,
                    Guests = r.Guests,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status.ToString(),
                    CreatedAt = r.CreatedAt,
                    TotalNights = (r.CheckOut - r.CheckIn).Days
                })
                .ToListAsync();

            return reservations;
        }

        // POST: api/Reservations
        [HttpPost]
        public async Task<ActionResult<ReservationResponseDto>> PostReservation(ReservationDto reservationDto)
        {
            // Validasyonlar
            if (reservationDto.CheckIn >= reservationDto.CheckOut)
            {
                return BadRequest("Check-in tarihi Check-out tarihinden önce olmalıdır");
            }

            if (reservationDto.CheckIn.Date < DateTime.Today)
            {
                return BadRequest("Check-in tarihi bugünden önce olamaz");
            }

            // User'ın var olup olmadığını kontrol et
            var user = await _context.Users.FindAsync(reservationDto.UserId);
            if (user == null)
            {
                return BadRequest("User bulunamadı");
            }

            // Hotel'ın var olup olmadığını kontrol et
            var hotel = await _context.Hotels.FindAsync(reservationDto.HotelId);
            if (hotel == null)
            {
                return BadRequest("Hotel bulunamadı");
            }

            // Property'nin var olup olmadığını kontrol et
            var property = await _context.Properties.FindAsync(reservationDto.PropertyId);
            if (property == null)
            {
                return BadRequest("Property bulunamadı");
            }

            // RoomType'ın var olup olmadığını kontrol et
            var roomType = await _context.RoomTypes.FindAsync(reservationDto.RoomTypeId);
            if (roomType == null)
            {
                return BadRequest("RoomType bulunamadı");
            }

            // Stok kontrolü yap
            var totalNights = (reservationDto.CheckOut - reservationDto.CheckIn).Days;
            var checkInDate = reservationDto.CheckIn.Date;
            
            for (int i = 0; i < totalNights; i++)
            {
                var checkDate = checkInDate.AddDays(i);
                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.RoomTypeId == reservationDto.RoomTypeId && a.Date == checkDate);
                
                if (availability == null || availability.Stock < 1)
                {
                    return BadRequest($"{checkDate:yyyy-MM-dd} tarihinde yeterli stok bulunmamaktadır");
                }
            }

            // Fiyat hesapla
            var totalPrice = 0m;
            for (int i = 0; i < totalNights; i++)
            {
                var checkDate = checkInDate.AddDays(i);
                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.RoomTypeId == reservationDto.RoomTypeId && a.Date == checkDate);
                
                var nightlyPrice = availability?.PriceOverride ?? roomType.BasePrice;
                totalPrice += nightlyPrice;
            }

            var reservation = new Reservation
            {
                UserId = reservationDto.UserId,
                HotelId = reservationDto.HotelId,
                PropertyId = reservationDto.PropertyId,
                RoomTypeId = reservationDto.RoomTypeId,
                CheckIn = reservationDto.CheckIn.Date,
                CheckOut = reservationDto.CheckOut.Date,
                Guests = reservationDto.Guests,
                TotalPrice = totalPrice,
                Status = ReservationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);

            // Stokları güncelle
            for (int i = 0; i < totalNights; i++)
            {
                var checkDate = checkInDate.AddDays(i);
                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.RoomTypeId == reservationDto.RoomTypeId && a.Date == checkDate);
                
                if (availability != null)
                {
                    availability.Stock -= 1;
                }
            }

            await _context.SaveChangesAsync();

            // Response DTO oluştur
            var responseDto = new ReservationResponseDto
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                UserEmail = user.Email,
                HotelId = reservation.HotelId,
                HotelName = hotel.Name,
                PropertyId = reservation.PropertyId,
                PropertyTitle = property.Title,
                RoomTypeId = reservation.RoomTypeId,
                RoomTypeName = roomType.Name,
                CheckIn = reservation.CheckIn,
                CheckOut = reservation.CheckOut,
                Guests = reservation.Guests,
                TotalPrice = reservation.TotalPrice,
                Status = reservation.Status.ToString(),
                CreatedAt = reservation.CreatedAt,
                TotalNights = totalNights
            };

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, responseDto);
        }

        // PUT: api/Reservations/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] string status)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            if (Enum.TryParse<ReservationStatus>(status, true, out var newStatus))
            {
                reservation.Status = newStatus;
                await _context.SaveChangesAsync();
                return NoContent();
            }

            return BadRequest("Geçersiz status değeri");
        }

        // DELETE: api/Reservations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            // Sadece Pending rezervasyonlar silinebilir
            if (reservation.Status != ReservationStatus.Pending)
            {
                return BadRequest("Sadece bekleyen rezervasyonlar silinebilir");
            }

            // Stokları geri ekle
            var totalNights = (reservation.CheckOut - reservation.CheckIn).Days;
            var checkInDate = reservation.CheckIn.Date;
            
            for (int i = 0; i < totalNights; i++)
            {
                var checkDate = checkInDate.AddDays(i);
                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.RoomTypeId == reservation.RoomTypeId && a.Date == checkDate);
                
                if (availability != null)
                {
                    availability.Stock += 1;
                }
            }

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReservationExists(int id)
        {
            return _context.Reservations.Any(e => e.Id == id);
        }
    }
}
