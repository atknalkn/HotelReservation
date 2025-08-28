using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;

namespace HotelApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        private readonly ILogger<ReservationsController> _logger;

        public ReservationsController(HotelDbContext context, ILogger<ReservationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Reservations
        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
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
        [Authorize]
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
        [Authorize(Policy = "CustomerOnly")]
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
        [Authorize(Policy = "HotelOwnerOnly")]
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
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult<ReservationResponseDto>> PostReservation(ReservationDto reservationDto)
        {
            try
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

                if (reservationDto.Guests < 1 || reservationDto.Guests > 10)
                {
                    return BadRequest("Misafir sayısı 1-10 arasında olmalıdır");
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

                // Transaction ile rezervasyon işlemini gerçekleştir
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Stok kontrolü ve rezervasyon
                    var (isAvailable, totalPrice, availabilityInfo) = await CheckAvailabilityAndCalculatePrice(
                        reservationDto.RoomTypeId, 
                        reservationDto.CheckIn, 
                        reservationDto.CheckOut, 
                        reservationDto.Guests);

                    if (!isAvailable)
                    {
                        return BadRequest("Seçilen tarih aralığında yeterli stok bulunmamaktadır");
                    }

                    // Rezervasyon oluştur
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
                    foreach (var info in availabilityInfo)
                    {
                        var availability = await _context.Availabilities
                            .FirstOrDefaultAsync(a => a.RoomTypeId == reservationDto.RoomTypeId && a.Date == info.Date);
                        
                        if (availability != null)
                        {
                            availability.Stock -= reservationDto.Guests;
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation("Rezervasyon başarıyla oluşturuldu: ID {ReservationId}, User: {UserId}, Hotel: {HotelId}", 
                        reservation.Id, reservation.UserId, reservation.HotelId);

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
                        TotalNights = (reservation.CheckOut - reservation.CheckIn).Days
                    };

                    return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, responseDto);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Rezervasyon oluşturulurken hata: {Message}", ex.Message);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rezervasyon işlemi sırasında beklenmeyen hata: {Message}", ex.Message);
                return StatusCode(500, "Rezervasyon işlemi sırasında bir hata oluştu");
            }
        }

        // PUT: api/Reservations/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] string status)
        {
            try
            {
                var reservation = await _context.Reservations.FindAsync(id);
                if (reservation == null)
                {
                    return NotFound();
                }

                if (Enum.TryParse<ReservationStatus>(status, true, out var newStatus))
                {
                    var oldStatus = reservation.Status;
                    reservation.Status = newStatus;

                    // Eğer rezervasyon iptal edildiyse stokları geri ekle
                    if (newStatus == ReservationStatus.Cancelled && oldStatus != ReservationStatus.Cancelled)
                    {
                        await RestoreAvailabilityStock(reservation);
                    }

                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Rezervasyon durumu güncellendi: ID {ReservationId}, Eski: {OldStatus}, Yeni: {NewStatus}", 
                        id, oldStatus, newStatus);
                    
                    return NoContent();
                }

                return BadRequest("Geçersiz status değeri");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rezervasyon durumu güncellenirken hata: {Message}", ex.Message);
                return StatusCode(500, "Durum güncellenirken bir hata oluştu");
            }
        }

        // DELETE: api/Reservations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            try
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

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Stokları geri ekle
                    await RestoreAvailabilityStock(reservation);

                    _context.Reservations.Remove(reservation);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation("Rezervasyon silindi: ID {ReservationId}", id);
                    return NoContent();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Rezervasyon silinirken hata: {Message}", ex.Message);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rezervasyon silinirken beklenmeyen hata: {Message}", ex.Message);
                return StatusCode(500, "Rezervasyon silinirken bir hata oluştu");
            }
        }

        // POST: api/Reservations/check-availability
        [HttpPost("check-availability")]
        public async Task<ActionResult<AvailabilityCheckResponseDto>> CheckAvailability([FromBody] AvailabilityCheckDto checkDto)
        {
            try
            {
                if (checkDto.CheckIn >= checkDto.CheckOut)
                {
                    return BadRequest("Check-in tarihi Check-out tarihinden önce olmalıdır");
                }

                var (isAvailable, totalPrice, availabilityInfo) = await CheckAvailabilityAndCalculatePrice(
                    checkDto.RoomTypeId, 
                    checkDto.CheckIn, 
                    checkDto.CheckOut, 
                    checkDto.Guests);

                var response = new AvailabilityCheckResponseDto
                {
                    IsAvailable = isAvailable,
                    TotalPrice = totalPrice,
                    CheckIn = checkDto.CheckIn,
                    CheckOut = checkDto.CheckOut,
                    TotalNights = (checkDto.CheckOut - checkDto.CheckIn).Days,
                    AvailabilityInfo = availabilityInfo
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok kontrolü sırasında hata: {Message}", ex.Message);
                return StatusCode(500, "Stok kontrolü sırasında bir hata oluştu");
            }
        }

        // Private helper methods
        private async Task<(bool IsAvailable, decimal TotalPrice, List<AvailabilityInfoDto> AvailabilityInfo)> 
            CheckAvailabilityAndCalculatePrice(int roomTypeId, DateTime checkIn, DateTime checkOut, int guests)
        {
            var totalNights = (checkOut - checkIn).Days;
            var checkInDate = checkIn.Date;
            var totalPrice = 0m;
            var availabilityInfo = new List<AvailabilityInfoDto>();

            // Tüm tarihler için stok kontrolü yap
            for (int i = 0; i < totalNights; i++)
            {
                var checkDate = checkInDate.AddDays(i);
                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.RoomTypeId == roomTypeId && a.Date == checkDate);

                if (availability == null || availability.Stock < guests)
                {
                    return (false, 0, new List<AvailabilityInfoDto>());
                }

                var nightlyPrice = availability.PriceOverride ?? 
                    (await _context.RoomTypes.FindAsync(roomTypeId))?.BasePrice ?? 0;
                
                totalPrice += nightlyPrice * guests;

                availabilityInfo.Add(new AvailabilityInfoDto
                {
                    Date = checkDate,
                    AvailableStock = availability.Stock,
                    Price = nightlyPrice
                });
            }

            return (true, totalPrice, availabilityInfo);
        }

        private async Task RestoreAvailabilityStock(Reservation reservation)
        {
            var totalNights = (reservation.CheckOut - reservation.CheckIn).Days;
            var checkInDate = reservation.CheckIn.Date;

            for (int i = 0; i < totalNights; i++)
            {
                var checkDate = checkInDate.AddDays(i);
                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.RoomTypeId == reservation.RoomTypeId && a.Date == checkDate);

                if (availability != null)
                {
                    availability.Stock += reservation.Guests;
                }
            }
        }

        private bool ReservationExists(int id)
        {
            return _context.Reservations.Any(e => e.Id == id);
        }
    }
}
