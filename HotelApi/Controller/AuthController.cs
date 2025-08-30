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

        // GET: api/Auth/test
        [AllowAnonymous]
        [HttpGet("test")]
        public ActionResult<string> Test()
        {
            return Ok("AuthController is working!");
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
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
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
                    FirstName = user.FirstName,
                    LastName = user.LastName,
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
                _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);
                
                // User'ı bul
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                {
                    _logger.LogWarning("Login failed: User not found for email: {Email}", loginDto.Email);
                    return BadRequest("Geçersiz email veya şifre");
                }

                // Şifre doğrulama
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login failed: Invalid password for email: {Email}", loginDto.Email);
                    return BadRequest("Geçersiz email veya şifre");
                }

                // JWT token üret
                var token = _jwtService.GenerateToken(user);
                _logger.LogInformation("Login successful for user: {Email} with role: {Role}", user.Email, user.Role);

                var response = new AuthResponseDto
                {
                    Token = token,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "User login failed for email: {Email}", loginDto.Email);
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
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role,
                    Gender = user.Gender,
                    PhoneNumber = user.PhoneNumber,
                    DateOfBirth = user.DateOfBirth,
                    IdentityNumber = user.IdentityNumber,
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

        // PUT: api/Auth/profile
        [Authorize]
        [HttpPut("profile")]
        public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileDto updateProfileDto)
        {
            try
            {
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

                // Email değişikliği varsa, yeni email'in başka kullanıcıda olup olmadığını kontrol et
                if (user.Email != updateProfileDto.Email)
                {
                    if (await _context.Users.AnyAsync(u => u.Email == updateProfileDto.Email && u.Id != userId))
                    {
                        return BadRequest("Bu email adresi zaten kullanımda");
                    }
                }

                // TC Kimlik No değişikliği varsa, yeni TC'nin başka kullanıcıda olup olmadığını kontrol et
                if (user.IdentityNumber != updateProfileDto.IdentityNumber)
                {
                    if (await _context.Users.AnyAsync(u => u.IdentityNumber == updateProfileDto.IdentityNumber && u.Id != userId))
                    {
                        return BadRequest("Bu TC Kimlik No zaten kullanımda");
                    }
                }

                // Kullanıcı bilgilerini güncelle
                user.FirstName = updateProfileDto.FirstName;
                user.LastName = updateProfileDto.LastName;
                user.Email = updateProfileDto.Email;
                user.Gender = updateProfileDto.Gender;
                user.PhoneNumber = updateProfileDto.PhoneNumber;
                user.DateOfBirth = updateProfileDto.DateOfBirth;
                user.IdentityNumber = updateProfileDto.IdentityNumber;

                await _context.SaveChangesAsync();

                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role,
                    Gender = user.Gender,
                    PhoneNumber = user.PhoneNumber,
                    DateOfBirth = user.DateOfBirth,
                    IdentityNumber = user.IdentityNumber,
                    CreatedAt = user.CreatedAt
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Profile update failed");
                return StatusCode(500, "Profil güncellenirken bir hata oluştu");
            }
        }

        // PUT: api/Auth/change-password
        [Authorize]
        [HttpPut("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            try
            {
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

                // Mevcut şifreyi doğrula
                if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    return BadRequest("Mevcut şifre yanlış");
                }

                // Yeni şifreyi hashle ve kaydet
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
                await _context.SaveChangesAsync();

                return Ok("Şifre başarıyla değiştirildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Password change failed");
                return StatusCode(500, "Şifre değiştirilirken bir hata oluştu");
            }
        }
    }
}
