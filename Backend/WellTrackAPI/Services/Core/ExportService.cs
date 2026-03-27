using ClosedXML.Excel;
using WellTrackAPI.Services.Core;
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

            var normalizedFrom = from?.ToUniversalTime();
            var normalizedTo = to?.ToUniversalTime();

            var stepsData = (await _stepService.GetAllAsync(userId))
                .Where(x => IsWithinRange(x.Date, normalizedFrom, normalizedTo))
                .ToList();
            AddSheet(workbook, "Steps", stepsData, new[] { "Date", "ActivityType", "StepsCount" });

            var sleepData = (await _sleepService.GetAllAsync(userId))
                .Where(x => IsWithinRange(x.Date, normalizedFrom, normalizedTo))
                .ToList();
            AddSheet(workbook, "Sleep", sleepData, new[] { "Date", "BedTime", "WakeUpTime", "Hours", "Quality" });

            var moodData = (await _moodService.GetAllAsync(userId))
                .Where(x => IsWithinRange(x.Date, normalizedFrom, normalizedTo))
                .ToList();
            AddSheet(workbook, "Mood", moodData, new[] { "Date", "Mood", "Notes" });

            var hydrationData = (await _hydrationService.GetAllAsync(userId))
                .Where(x => IsWithinRange(x.Date, normalizedFrom, normalizedTo))
                .ToList();
            AddSheet(workbook, "Hydration", hydrationData, new[] { "Date", "WaterIntakeLiters" });

            var habitData = (await _habitService.GetAllAsync(userId))
                .Where(x => IsWithinRange(x.Date, normalizedFrom, normalizedTo))
                .ToList();
            AddSheet(workbook, "Habit", habitData, new[] { "Date", "Name", "Completed" });

            var foodData = (await _foodService.GetAllAsync(userId))
                .Where(x => IsWithinRange(x.Date, normalizedFrom, normalizedTo))
                .ToList();
            AddSheet(workbook, "Food", foodData, new[] { "Date", "FoodName", "Calories", "Protein", "Carbs", "Fat", "ServingSize", "MealType" });

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private bool IsWithinRange(DateTime value, DateTime? from, DateTime? to)
        {
            if (from.HasValue && value < from.Value)
                return false;

            if (to.HasValue && value > to.Value)
                return false;

            return true;
        }

        private void AddSheet<T>(XLWorkbook workbook, string sheetName, IEnumerable<T> data, string[] headers)
        {
            var sheet = workbook.AddWorksheet(sheetName);

            // Header row
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
            }

            int row = 2;
            foreach (var item in data)
            {
                for (int col = 0; col < headers.Length; col++)
                {
                    var header = headers[col];
                    var prop = item!.GetType().GetProperty(header); //reflection to get property by name
                    if (prop == null) continue;

                    var value = prop.GetValue(item);
                    var cell = sheet.Cell(row, col + 1);

                    WriteCellValue(cell, value);
                    ApplyColumnFormat(cell, sheetName, header);
                }

                row++;
            }

            FormatSheet(sheet);
        }

        private void WriteCellValue(IXLCell cell, object? value)
        {
            if (value == null)
            {
                cell.SetValue(string.Empty);
                return;
            }

            switch (value)
            {
                case DateTime dt:
                    cell.SetValue(dt.ToLocalTime());
                    break;

                case bool b:
                    cell.SetValue(b);
                    break;

                case int i:
                    cell.SetValue(i);
                    break;

                case long l:
                    cell.SetValue(l);
                    break;

                case double d:
                    cell.SetValue(d);
                    break;

                case float f:
                    cell.SetValue(f);
                    break;

                case decimal m:
                    cell.SetValue(m);
                    break;

                case string s:
                    cell.SetValue(s);
                    break;

                default:
                    cell.SetValue(value.ToString() ?? string.Empty);
                    break;
            }
        }

        private void ApplyColumnFormat(IXLCell cell, string sheetName, string header)
        {
            // DateTime fields
            if (header is "Date" or "BedTime" or "WakeUpTime")
            {
                cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                return;
            }

            // Integer/Count fields
            if (header is "StepsCount" or "Id")
            {
                cell.Style.NumberFormat.Format = "0"; //formatting as whole number, no decimals
                return;
            }

            // Decimal/Float fields (calories, nutrients, water intake)
            if (header is "Hours" or "WaterIntakeLiters" or "Calories" or "Protein" or "Carbs" or "Fat")
            {
                cell.Style.NumberFormat.Format = "0.##"; //formatting as decimal with up to 2 decimal places
                return;
            }

            // Boolean fields - handled by WriteCellValue
            if (header == "Completed")
            {
                return;
            }

            // Text fields (default)
            if (header is "ActivityType" or "Mood" or "Quality" or "Notes" or "Name" or "FoodName" or "ServingSize" or "MealType")
            {
                // Text is the default, no special formatting needed
                return;
            }
        }

        private void FormatSheet(IXLWorksheet sheet)
        {
            sheet.Columns().AdjustToContents();
            sheet.SheetView.FreezeRows(1);

            if (sheet.RangeUsed() != null)
            {
                sheet.RangeUsed()!.SetAutoFilter();
            }
        }
    }
}