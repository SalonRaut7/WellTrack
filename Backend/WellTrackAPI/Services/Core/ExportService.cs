using ClosedXML.Excel;
using WellTrackAPI.Services.Interfaces;
using WellTrackAPI.Services.Trackers;
using WellTrackAPI.Services.Food;

namespace WellTrackAPI.Services
{
    public class TrackerExportService : ITrackerExportService
    {
        private readonly IStepService _stepService;
        private readonly ISleepService _sleepService;
        private readonly IMoodService _moodService;
        private readonly IHydrationService _hydrationService;
        private readonly IHabitService _habitService;
        private readonly IFoodService _foodService;

        public TrackerExportService(
            IStepService stepService,
            ISleepService sleepService,
            IMoodService moodService,
            IHydrationService hydrationService,
            IHabitService habitService,
            IFoodService foodService)
        {
            _stepService = stepService;
            _sleepService = sleepService;
            _moodService = moodService;
            _hydrationService = hydrationService;
            _habitService = habitService;
            _foodService = foodService;
        }

        public async Task<byte[]> ExportAllTrackersToExcelAsync(
            string userId,
            DateTime? from = null,
            DateTime? to = null)
        {
            using var workbook = new XLWorkbook();

            // Export each tracker using the dynamic helper
            var stepsData = await _stepService.GetAllAsync(userId);
            AddSheet(workbook, "Steps", stepsData, new[] { "Date", "ActivityType", "StepsCount" });

            var sleepData = await _sleepService.GetAllAsync(userId);
            AddSheet(workbook, "Sleep", sleepData, new[] { "Date", "BedTime", "WakeUpTime", "Hours", "Quality" });

            var moodData = await _moodService.GetAllAsync(userId);
            AddSheet(workbook, "Mood", moodData, new[] { "Date", "Mood", "Notes" });

            var hydrationData = await _hydrationService.GetAllAsync(userId);
            AddSheet(workbook, "Hydration", hydrationData, new[] { "Date", "WaterIntakeLiters" });

            var habitData = await _habitService.GetAllAsync(userId);
            AddSheet(workbook, "Habit", habitData, new[] { "Date", "Name", "Completed" });

            var foodData = await _foodService.GetAllAsync(userId);
            AddSheet(workbook, "Food", foodData, new[] { "Date", "FoodName", "Calories", "Protein", "Carbs", "Fat", "ServingSize", "MealType" });

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private void AddSheet<T>(XLWorkbook workbook, string sheetName, IEnumerable<T> data, string[] headers)
        {
            var sheet = workbook.AddWorksheet(sheetName);
            //headers title (first row)
            for (int i = 0; i < headers.Length; i++)
            {
                sheet.Cell(1, i + 1).Value = headers[i];
            }
            //now starting from this row, we have to write the actual data, we can use reflection to get the property values based on the headers
            //reflection = we will look at the properties of the data type T and match them with the headers to get the values dynamically, this way we can reuse this method for any tracker type without hardcoding property names
            int row = 2;
            foreach (var item in data)
            {
                for (int col = 0; col < headers.Length; col++)
                {
                    var prop = item.GetType().GetProperty(headers[col]);
                    if (prop != null)
                    {
                        var value = prop.GetValue(item);

                        sheet.Cell(row, col + 1).Value = value switch
                        {
                            null => "",
                            DateTime dt => dt.ToLocalTime(),
                            int i => i,
                            double d => d,
                            bool b => b,
                            _ => value.ToString()
                        };
                    }
                }
                row++;
            }

            FormatSheet(sheet);
        }

        private void FormatSheet(IXLWorksheet sheet)
        {
            sheet.Row(1).Style.Font.Bold = true;
            sheet.Columns().AdjustToContents();
        }
    }
}