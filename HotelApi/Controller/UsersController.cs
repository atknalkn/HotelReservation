using Microsoft.AspNetCore.Mvc;
using HotelApi.Data;
using HotelApi.Models;
using HotelApi.DTOs;

namespace HotelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public UsersController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_context.Users.ToList());
        }

        // GET: api/users/1
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // POST: api/users
        [HttpPost]
        public IActionResult Create(UserDto userDto)
        {
            var user = new User
            {
                Email = userDto.Email,
                PasswordHash = userDto.PasswordHash,
                Role = userDto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        // PUT: api/users/1
        [HttpPut("{id}")]
        public IActionResult Update(int id, UserDto userDto)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound();

            user.Email = userDto.Email;
            user.PasswordHash = userDto.PasswordHash;
            user.Role = userDto.Role;

            _context.SaveChanges();
            return Ok(user);
        }

        // DELETE: api/users/1
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
