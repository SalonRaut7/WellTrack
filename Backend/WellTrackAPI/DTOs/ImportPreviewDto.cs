namespace WellTrackAPI.DTOs{
    public class ImportPreviewDto
    {
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();

        public List<StepDTO> Steps { get; set; } = new();
        public List<SleepDTO> Sleep { get; set; } = new();
        public List<MoodDTO> Mood { get; set; } = new();
        public List<HydrationDTO> Hydration { get; set; } = new();
        public List<HabitDTO> Habit { get; set; } = new();
        public List<FoodEntryDTO> Food { get; set; } = new();
    }
}
