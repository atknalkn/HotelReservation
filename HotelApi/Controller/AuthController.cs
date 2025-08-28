using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;
using HotelApi.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;

namespace HotelApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HotelDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            HotelDbContext context, 
            IJwtService jwtService, 
            ILogger<AuthController> logger)
        {
            _context = context;
            _jwtService = jwtService;
            _logger = logger;
        }

        // POST: api/Auth/register
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            try
            {
                // Email zaten kullanımda mı kontrol et
                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return BadRequest("Bu email adresi zaten kullanımda");
                }

                // Şifre hashleme
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                // Yeni user oluştur
                var user = new User
                {
                    Email = registerDto.Email,
                    PasswordHash = passwordHash,
                    Role = registerDto.Role,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // JWT token üret
                var token = _jwtService.GenerateToken(user);

                var response = new AuthResponseDto
                {
                    Token = token,
                    Email = user.Email,
                    Role = user.Role,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60)
                };

                return CreatedAtAction(nameof(Login), response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "User registration failed");
                return StatusCode(500, "Kayıt işlemi başarısız");
            }
        }

        // POST: api/Auth/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            try
            {
                // User'ı bul
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                {
                    return BadRequest("Geçersiz email veya şifre");
                }

                // Şifre doğrulama
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    return BadRequest("Geçersiz email veya şifre");
                }

                // JWT token üret
                var token = _jwtService.GenerateToken(user);

                var response = new AuthResponseDto
                {
                    Token = token,
                    Email = user.Email,
                    Role = user.Role,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "User login failed");
                return StatusCode(500, "Giriş işlemi başarısız");
            }
        }

        // GET: api/Auth/me
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userIdClaim = HttpContext.User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized();
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("User bulunamadı");
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get current user failed");
                return StatusCode(500, "Kullanıcı bilgileri alınamadı");
            }
        }
    }
}
