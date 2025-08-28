using HotelApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelApi.Data
{
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

        public DbSet<Hotel> Hotels => Set<Hotel>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Property> Properties => Set<Property>();
        public DbSet<RoomType> RoomTypes => Set<RoomType>();
        public DbSet<Availability> Availabilities => Set<Availability>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<CommissionSettings> CommissionSettings => Set<CommissionSettings>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Hotel.Status -> string olarak sakla (enum-to-string)
            modelBuilder.Entity<Hotel>()
                .Property(h => h.Status)
                .HasConversion<string>();

            // (Opsiyonel) Hotel.OwnerUserId FK ve TaxNo index/unique
            modelBuilder.Entity<Hotel>()
                .HasOne(h => h.OwnerUser)
                .WithMany()
                .HasForeignKey(h => h.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hotel>()
                .HasIndex(h => h.TaxNo)
                .IsUnique();

            // (Varsa) Property -> Hotel FK
            modelBuilder.Entity<Property>()
                .HasOne(p => p.Hotel)
                .WithMany()
                .HasForeignKey(p => p.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Property>()
                .HasIndex(p => new { p.HotelId, p.Title })
                .IsUnique();

            // RoomType -> Property FK
            modelBuilder.Entity<RoomType>()
                .HasOne(rt => rt.Property)
                .WithMany(p => p.RoomTypes)
                .HasForeignKey(rt => rt.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // RoomType için index (PropertyId + Name unique)
            modelBuilder.Entity<RoomType>()
                .HasIndex(rt => new { rt.PropertyId, rt.Name })
                .IsUnique();

            // Availability -> RoomType FK
            modelBuilder.Entity<Availability>()
                .HasOne(a => a.RoomType)
                .WithMany(rt => rt.Availabilities)
                .HasForeignKey(a => a.RoomTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Availability için index (RoomTypeId + Date unique)
            modelBuilder.Entity<Availability>()
                .HasIndex(a => new { a.RoomTypeId, a.Date })
                .IsUnique();

            // Reservation -> User FK
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> Hotel FK
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Hotel)
                .WithMany(h => h.Reservations)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> Property FK
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Property)
                .WithMany()
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> RoomType FK
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.RoomType)
                .WithMany()
                .HasForeignKey(r => r.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation için index (UserId + CheckIn)
            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.UserId, r.CheckIn });

            // Reservation için index (HotelId + CheckIn)
            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.HotelId, r.CheckIn });

            // CommissionSettings -> User FK
            modelBuilder.Entity<CommissionSettings>()
                .HasOne(cs => cs.UpdatedByUser)
                .WithMany()
                .HasForeignKey(cs => cs.UpdatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // CommissionSettings için index (IsActive + LastUpdated)
            modelBuilder.Entity<CommissionSettings>()
                .HasIndex(cs => new { cs.IsActive, cs.LastUpdated });

            // Review -> Hotel FK
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Hotel)
                .WithMany(h => h.Reviews)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review -> Property FK
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Property)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review -> RoomType FK
            modelBuilder.Entity<Review>()
                .HasOne(r => r.RoomType)
                .WithMany(rt => rt.Reviews)
                .HasForeignKey(r => r.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review -> User FK
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review -> Reservation FK
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reservation)
                .WithMany()
                .HasForeignKey(r => r.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review için index'ler
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.HotelId, r.Status, r.CreatedAt });

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.PropertyId, r.Status, r.CreatedAt });

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.RoomTypeId, r.Status, r.CreatedAt });

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.CreatedAt });

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.ReservationId })
                .IsUnique();
        }
    }
}
