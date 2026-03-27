namespace WellTrackAPI.DTOs
{
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

        public ImportOverwriteConflictsDto OverwriteConflicts { get; set; } = new();
    }

    public class ImportOverwriteConflictsDto
    {
        public List<StepDTO> Steps { get; set; } = new();
        public List<SleepDTO> Sleep { get; set; } = new();
        public List<MoodDTO> Mood { get; set; } = new();
        public List<HydrationDTO> Hydration { get; set; } = new();
        public List<HabitDTO> Habit { get; set; } = new();
        public List<FoodEntryDTO> Food { get; set; } = new();

        public bool HasConflicts =>
            Steps.Count > 0 ||
            Sleep.Count > 0 ||
            Mood.Count > 0 ||
            Hydration.Count > 0 ||
            Habit.Count > 0 ||
            Food.Count > 0;
    }

    public class ImportConfirmRequestDto
    {
        public ImportPreviewDto Preview { get; set; } = new();
        public bool OverwriteConflicts { get; set; }
    }
}
