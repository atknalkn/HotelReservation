using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelApi.Models
{
    public class Availability
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int RoomTypeId { get; set; }
        
        [Required]
        [Column(TypeName = "date")]
        public DateTime Date { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PriceOverride { get; set; }
        
        // Navigation property
        [ForeignKey("RoomTypeId")]
        public RoomType? RoomType { get; set; }
    }
}
