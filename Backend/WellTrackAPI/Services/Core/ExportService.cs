using ClosedXML.Excel;
using WellTrackAPI.Services.Interfaces;
using WellTrackAPI.Services.Trackers;
using WellTrackAPI.Services.Food;

namespace WellTrackAPI.Services
{
    public class ExportService : IExportService
    {
        private readonly IStepService _stepService;
        private readonly ISleepService _sleepService;
        private readonly IMoodService _moodService;
        private readonly IHydrationService _hydrationService;
        private readonly IHabitService _habitService;
        private readonly IFoodService _foodService;

        public ExportService(
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

            for (int i = 0; i < headers.Length; i++)
            {
                sheet.Cell(1, i + 1).Value = headers[i];
            }

            int row = 2;
            foreach (var item in data)
            {
                for (int col = 0; col < headers.Length; col++)
                {
                    var header = headers[col];
                    var prop = item!.GetType().GetProperty(header); //reflection: get property by header name
                    if (prop == null) continue;

                    var value = prop.GetValue(item);
                    sheet.Cell(row, col + 1).Value = FormatCellValue(value);
                }

                row++;
            }

            FormatSheet(sheet);
        }

        private string FormatCellValue(object? value)
        {
            if (value == null) return "";

            if (value is DateTime dt)
            {
                var local = dt.ToLocalTime();
                return local.ToString("yyyy-MM-dd HH:mm:ss");
            }

            if (value is bool b) return b ? "true" : "false";
            if (value is int i) return i.ToString();
            if (value is double d) return d.ToString();
            return value.ToString() ?? "";
        }

        private void FormatSheet(IXLWorksheet sheet)
        {
            sheet.Row(1).Style.Font.Bold = true;
            sheet.Columns().AdjustToContents();
        }
    }
}