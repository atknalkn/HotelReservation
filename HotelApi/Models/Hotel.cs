namespace HotelApi.Models
{
    public class Hotel
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public int StarRating { get; set; }  // 1-5
    }
}
