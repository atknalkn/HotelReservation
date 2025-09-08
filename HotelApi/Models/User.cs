namespace HotelApi.Models
{
    public class User
    {
        public int Id { get; set; }                         // PK
        public string FirstName { get; set; } = string.Empty;   // İsim
        public string LastName { get; set; } = string.Empty;    // Soyisim
        public string Email { get; set; } = string.Empty;   // unique olacak
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer";      // Admin / HotelOwner / Customer
        public string Gender { get; set; } = string.Empty;  // Cinsiyet
        public string PhoneNumber { get; set; } = string.Empty; // Telefon numarası
        public DateTime? DateOfBirth { get; set; }          // Doğum tarihi
        public string IdentityNumber { get; set; } = string.Empty; // TC Kimlik No
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Reservation>? Reservations { get; set; } = new List<Reservation>();
    }
}
