namespace WellTrackAPI.DTOs
{
    public class DailyHydrationSummaryDTO
    {
        public double TodayTotalLiters { get; set; }
        public int DailyGoalMl { get; set; }
        public int RemainingMl { get; set; }
        public int TodayTotalMl => (int)Math.Round(TodayTotalLiters * 1000);
    }
}
