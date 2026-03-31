using ClosedXML.Excel;
using WellTrackAPI.Services.Core;
using WellTrackAPI.Services.Trackers;
using WellTrackAPI.Services.Food;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class ExportService : IExportService
    {
        private static readonly IReadOnlyList<ColumnDefinition<StepEntry>> StepColumns = new[]
        {
            ColumnDefinition<StepEntry>.Text("Date", x => x.Date, ColumnDataKind.DateTime),
            ColumnDefinition<StepEntry>.Text("ActivityType", x => x.ActivityType),
            ColumnDefinition<StepEntry>.Text("StepsCount", x => x.StepsCount, ColumnDataKind.Integer)
        };

        private static readonly IReadOnlyList<ColumnDefinition<SleepEntry>> SleepColumns = new[]
        {
            ColumnDefinition<SleepEntry>.Text("Date", x => x.Date, ColumnDataKind.DateTime),
            ColumnDefinition<SleepEntry>.Text("BedTime", x => x.BedTime, ColumnDataKind.DateTime),
            ColumnDefinition<SleepEntry>.Text("WakeUpTime", x => x.WakeUpTime, ColumnDataKind.DateTime),
            ColumnDefinition<SleepEntry>.Text("Hours", x => x.Hours, ColumnDataKind.Decimal),
            ColumnDefinition<SleepEntry>.Text("Quality", x => x.Quality)
        };

        private static readonly IReadOnlyList<ColumnDefinition<MoodEntry>> MoodColumns = new[]
        {
            ColumnDefinition<MoodEntry>.Text("Date", x => x.Date, ColumnDataKind.DateTime),
            ColumnDefinition<MoodEntry>.Text("Mood", x => x.Mood),
            ColumnDefinition<MoodEntry>.Text("Notes", x => x.Notes)
        };

        private static readonly IReadOnlyList<ColumnDefinition<HydrationEntry>> HydrationColumns = new[]
        {
            ColumnDefinition<HydrationEntry>.Text("Date", x => x.Date, ColumnDataKind.DateTime),
            ColumnDefinition<HydrationEntry>.Text("WaterIntakeLiters", x => x.WaterIntakeLiters, ColumnDataKind.Decimal)
        };

        private static readonly IReadOnlyList<ColumnDefinition<HabitEntry>> HabitColumns = new[]
        {
            ColumnDefinition<HabitEntry>.Text("Date", x => x.Date, ColumnDataKind.DateTime),
            ColumnDefinition<HabitEntry>.Text("Name", x => x.Name),
            ColumnDefinition<HabitEntry>.Text("Completed", x => x.Completed, ColumnDataKind.Boolean)
        };

        private static readonly IReadOnlyList<ColumnDefinition<FoodEntryDTO>> FoodColumns = new[]
        {
            ColumnDefinition<FoodEntryDTO>.Text("Date", x => x.Date, ColumnDataKind.DateTime),
            ColumnDefinition<FoodEntryDTO>.Text("FoodName", x => x.FoodName),
            ColumnDefinition<FoodEntryDTO>.Text("Calories", x => x.Calories, ColumnDataKind.Decimal),
            ColumnDefinition<FoodEntryDTO>.Text("Protein", x => x.Protein, ColumnDataKind.Decimal),
            ColumnDefinition<FoodEntryDTO>.Text("Carbs", x => x.Carbs, ColumnDataKind.Decimal),
            ColumnDefinition<FoodEntryDTO>.Text("Fat", x => x.Fat, ColumnDataKind.Decimal),
            ColumnDefinition<FoodEntryDTO>.Text("ServingSize", x => x.ServingSize),
            ColumnDefinition<FoodEntryDTO>.Text("MealType", x => x.MealType)
        };

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

            var stepsData = FilterByRange(await _stepService.GetAllAsync(userId), x => x.Date, normalizedFrom, normalizedTo);
            var sleepData = FilterByRange(await _sleepService.GetAllAsync(userId), x => x.Date, normalizedFrom, normalizedTo);
            var moodData = FilterByRange(await _moodService.GetAllAsync(userId), x => x.Date, normalizedFrom, normalizedTo);
            var hydrationData = FilterByRange(await _hydrationService.GetAllAsync(userId), x => x.Date, normalizedFrom, normalizedTo);
            var habitData = FilterByRange(await _habitService.GetAllAsync(userId), x => x.Date, normalizedFrom, normalizedTo);
            var foodData = FilterByRange(await _foodService.GetAllAsync(userId), x => x.Date, normalizedFrom, normalizedTo);

            BuildStepsSheet(workbook, stepsData);
            BuildSleepSheet(workbook, sleepData);
            BuildMoodSheet(workbook, moodData);
            BuildHydrationSheet(workbook, hydrationData);
            BuildHabitSheet(workbook, habitData);
            BuildFoodSheet(workbook, foodData);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static bool IsWithinRange(DateTime value, DateTime? from, DateTime? to)
        {
            if (from.HasValue && value < from.Value)
                return false;

            if (to.HasValue && value > to.Value)
                return false;

            return true;
        }

        private static List<T> FilterByRange<T>(
            IEnumerable<T> source,
            Func<T, DateTime> dateSelector,
            DateTime? from,
            DateTime? to)
        {
            return source
                .Where(x => IsWithinRange(dateSelector(x), from, to))
                .ToList();
        }

        private void BuildStepsSheet(XLWorkbook workbook, IEnumerable<StepEntry> data)
        {
            AddSheet(workbook, "Steps", data, StepColumns);
        }

        private void BuildSleepSheet(XLWorkbook workbook, IEnumerable<SleepEntry> data)
        {
            AddSheet(workbook, "Sleep", data, SleepColumns);
        }

        private void BuildMoodSheet(XLWorkbook workbook, IEnumerable<MoodEntry> data)
        {
            AddSheet(workbook, "Mood", data, MoodColumns);
        }

        private void BuildHydrationSheet(XLWorkbook workbook, IEnumerable<HydrationEntry> data)
        {
            AddSheet(workbook, "Hydration", data, HydrationColumns);
        }

        private void BuildHabitSheet(XLWorkbook workbook, IEnumerable<HabitEntry> data)
        {
            AddSheet(workbook, "Habit", data, HabitColumns);
        }

        private void BuildFoodSheet(XLWorkbook workbook, IEnumerable<FoodEntryDTO> data)
        {
            AddSheet(workbook, "Food", data, FoodColumns);
        }

        private void AddSheet<T>(XLWorkbook workbook, string sheetName, IEnumerable<T> data, IReadOnlyList<ColumnDefinition<T>> columns)
        {
            var sheet = workbook.AddWorksheet(sheetName);

            // Header row
            for (int i = 0; i < columns.Count; i++)
            {
                var cell = sheet.Cell(1, i + 1);
                cell.Value = columns[i].Header;
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
            }

            int row = 2;
            foreach (var item in data)
            {
                for (int col = 0; col < columns.Count; col++)
                {
                    var column = columns[col];
                    var value = column.ValueSelector(item);
                    var cell = sheet.Cell(row, col + 1);

                    WriteCellValue(cell, value);
                    ApplyColumnFormat(cell, column.Kind);
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

        private static void ApplyColumnFormat(IXLCell cell, ColumnDataKind kind)
        {
            switch (kind)
            {
                case ColumnDataKind.DateTime:
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                    break;
                case ColumnDataKind.Integer:
                    cell.Style.NumberFormat.Format = "0";
                    break;
                case ColumnDataKind.Decimal:
                    cell.Style.NumberFormat.Format = "0.##";
                    break;
            }
        }

        private static void FormatSheet(IXLWorksheet sheet)
        {
            sheet.Columns().AdjustToContents();
            sheet.SheetView.FreezeRows(1);

            if (sheet.RangeUsed() != null)
            {
                sheet.RangeUsed()!.SetAutoFilter();
            }
        }

        private enum ColumnDataKind //enum to tell what kind of formatting to apply to a column
        {
            Text,
            DateTime,
            Integer,
            Decimal,
            Boolean
        }

        private sealed class ColumnDefinition<T>
        {
            private ColumnDefinition(string header, Func<T, object?> valueSelector, ColumnDataKind kind)
            {
                Header = header;
                ValueSelector = valueSelector;
                Kind = kind;
            }

            public string Header { get; }
            public Func<T, object?> ValueSelector { get; }
            public ColumnDataKind Kind { get; }

            public static ColumnDefinition<T> Text(string header, Func<T, object?> selector, ColumnDataKind kind = ColumnDataKind.Text)
                => new(header, selector, kind);
        }
    }
}