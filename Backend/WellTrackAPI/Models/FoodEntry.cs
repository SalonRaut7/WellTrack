namespace WellTrackAPI.Models
{
    public class FoodEntry
    {
        public int Id { get; set; }

        public string FoodName { get; set; } = null!;

        public double Calories { get; set; }
        public double Protein { get; set; }
        public double Carbs { get; set; }
        public double Fat { get; set; }

        public string ServingSize { get; set; } = null!;
        public string MealType { get; set; } = null!; 
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
