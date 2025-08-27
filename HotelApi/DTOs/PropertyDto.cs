namespace HotelApi.DTOs
{
    public class PropertyDto
    {
        public int HotelId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string City { get; set; } = "";
        public string Address { get; set; } = "";
        public int Stars { get; set; }
        public string Location { get; set; } = "";
    }
}
