using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Services.Interfaces;
using WellTrackAPI.Services.Food;
using WellTrackAPI.Services.Trackers;

namespace WellTrackAPI.Services.Core
{
    public class ImportService : IImportService
    {
        private readonly IStepService _stepService;
        private readonly ISleepService _sleepService;
        private readonly IMoodService _moodService;
        private readonly IHydrationService _hydrationService;
        private readonly IHabitService _habitService;
        private readonly IFoodService _foodService;
        private readonly ApplicationDbContext _context;

        public ImportService(
            IStepService stepService,
            ISleepService sleepService,
            IMoodService moodService,
            IHydrationService hydrationService,
            IHabitService habitService,
            IFoodService foodService,
            ApplicationDbContext context)
        {
            _stepService = stepService;
            _sleepService = sleepService;
            _moodService = moodService;
            _hydrationService = hydrationService;
            _habitService = habitService;
            _foodService = foodService;
            _context = context;
        }

        public async Task<ImportPreviewDto> ParseAndValidateAsync(IFormFile file, string userId)
        {
            var preview = new ImportPreviewDto();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var workbook = new XLWorkbook(stream);

            ParseStepsSheet(workbook, preview);
            ParseSleepSheet(workbook, preview);
            ParseMoodSheet(workbook, preview);
            ParseHydrationSheet(workbook, preview);
            ParseHabitSheet(workbook, preview);
            ParseFoodSheet(workbook, preview);

            preview.Steps.RemoveAll(x => x.Date > DateTime.UtcNow);
            preview.Sleep.RemoveAll(x => x.Date > DateTime.UtcNow);
            preview.Mood.RemoveAll(x => x.Date > DateTime.UtcNow);
            preview.Hydration.RemoveAll(x => x.Date > DateTime.UtcNow);
            preview.Habit.RemoveAll(x => x.Date > DateTime.UtcNow);
            preview.Food.RemoveAll(x => x.Date > DateTime.UtcNow);

            RemoveInFileDuplicates(preview);
            await RemoveExistingDatabaseDuplicatesAndTimestampConflicts(preview, userId);

            return preview;
        }

        public async Task SaveAsync(ImportPreviewDto dto, string userId)
        {
            if (dto.Errors.Any())
                throw new InvalidOperationException("Cannot import data with validation errors.");

            await _stepService.AddRangeAsync(dto.Steps, userId);
            await _sleepService.AddRangeAsync(dto.Sleep, userId);
            await _moodService.AddRangeAsync(dto.Mood, userId);
            await _hydrationService.AddRangeAsync(dto.Hydration, userId);
            await _habitService.AddRangeAsync(dto.Habit, userId);
            await _foodService.AddRangeAsync(dto.Food, userId);
        }

        private void RemoveInFileDuplicates(ImportPreviewDto preview)
        {
            var originalStepsCount = preview.Steps.Count;
            preview.Steps = preview.Steps
                .GroupBy(GetStepKey)
                .Select(g => g.First())
                .ToList();
            if (preview.Steps.Count < originalStepsCount)
                preview.Warnings.Add($"Steps: {originalStepsCount - preview.Steps.Count} duplicate row(s) found inside the file and removed.");

            var originalSleepCount = preview.Sleep.Count;
            preview.Sleep = preview.Sleep
                .GroupBy(GetSleepKey)
                .Select(g => g.First())
                .ToList();
            if (preview.Sleep.Count < originalSleepCount)
                preview.Warnings.Add($"Sleep: {originalSleepCount - preview.Sleep.Count} duplicate row(s) found inside the file and removed.");

            var originalMoodCount = preview.Mood.Count;
            preview.Mood = preview.Mood
                .GroupBy(GetMoodKey)
                .Select(g => g.First())
                .ToList();
            if (preview.Mood.Count < originalMoodCount)
                preview.Warnings.Add($"Mood: {originalMoodCount - preview.Mood.Count} duplicate row(s) found inside the file and removed.");

            var originalHydrationCount = preview.Hydration.Count;
            preview.Hydration = preview.Hydration
                .GroupBy(GetHydrationKey)
                .Select(g => g.First())
                .ToList();
            if (preview.Hydration.Count < originalHydrationCount)
                preview.Warnings.Add($"Hydration: {originalHydrationCount - preview.Hydration.Count} duplicate row(s) found inside the file and removed.");

            var originalHabitCount = preview.Habit.Count;
            preview.Habit = preview.Habit
                .GroupBy(GetHabitKey)
                .Select(g => g.First())
                .ToList();
            if (preview.Habit.Count < originalHabitCount)
                preview.Warnings.Add($"Habit: {originalHabitCount - preview.Habit.Count} duplicate row(s) found inside the file and removed.");

            var originalFoodCount = preview.Food.Count;
            preview.Food = preview.Food
                .GroupBy(GetFoodKey)
                .Select(g => g.First())
                .ToList();
            if (preview.Food.Count < originalFoodCount)
                preview.Warnings.Add($"Food: {originalFoodCount - preview.Food.Count} duplicate row(s) found inside the file and removed.");
        }

        private async Task RemoveExistingDatabaseDuplicatesAndTimestampConflicts(ImportPreviewDto preview, string userId)
        {
            await ProcessStepDuplicates(preview, userId);
            await ProcessSleepDuplicates(preview, userId);
            await ProcessMoodDuplicates(preview, userId);
            await ProcessHydrationDuplicates(preview, userId);
            await ProcessHabitDuplicates(preview, userId);
            await ProcessFoodDuplicates(preview, userId);
        }

        private async Task ProcessStepDuplicates(ImportPreviewDto preview, string userId)
        {
            var dbRows = await _context.StepEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var exactKeys = dbRows.Select(GetStepKey).ToHashSet();
            var timestampKeys = dbRows.Select(x => FormatUtc(x.Date)).ToHashSet();

            var exactDuplicates = preview.Steps
                .Where(x => exactKeys.Contains(GetStepKey(x)))
                .ToList();

            if (exactDuplicates.Any())
            {
                preview.Steps = preview.Steps
                    .Where(x => !exactKeys.Contains(GetStepKey(x)))
                    .ToList();

                preview.Warnings.Add($"Steps: {exactDuplicates.Count} row(s) already exist in database and will not be imported.");
            }

            var timestampConflicts = preview.Steps
                .Where(x => timestampKeys.Contains(FormatUtc(x.Date)))
                .ToList();

            if (timestampConflicts.Any())
            {
                preview.Steps = preview.Steps
                    .Where(x => !timestampKeys.Contains(FormatUtc(x.Date)))
                    .ToList();

                preview.Warnings.Add($"Steps: {timestampConflicts.Count} row(s) conflict with an existing record at the same timestamp and will not be imported.");
            }
        }

        private async Task ProcessSleepDuplicates(ImportPreviewDto preview, string userId)
        {
            var dbRows = await _context.SleepEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var exactKeys = dbRows.Select(GetSleepKey).ToHashSet();
            var timestampKeys = dbRows.Select(x => FormatUtc(x.Date)).ToHashSet();

            var exactDuplicates = preview.Sleep
                .Where(x => exactKeys.Contains(GetSleepKey(x)))
                .ToList();

            if (exactDuplicates.Any())
            {
                preview.Sleep = preview.Sleep
                    .Where(x => !exactKeys.Contains(GetSleepKey(x)))
                    .ToList();

                preview.Warnings.Add($"Sleep: {exactDuplicates.Count} row(s) already exist in database and will not be imported.");
            }

            var timestampConflicts = preview.Sleep
                .Where(x => timestampKeys.Contains(FormatUtc(x.Date)))
                .ToList();

            if (timestampConflicts.Any())
            {
                preview.Sleep = preview.Sleep
                    .Where(x => !timestampKeys.Contains(FormatUtc(x.Date)))
                    .ToList();

                preview.Warnings.Add($"Sleep: {timestampConflicts.Count} row(s) conflict with an existing record at the same timestamp and will not be imported.");
            }
        }

        private async Task ProcessMoodDuplicates(ImportPreviewDto preview, string userId)
        {
            var dbRows = await _context.MoodEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var exactKeys = dbRows.Select(GetMoodKey).ToHashSet();
            var timestampKeys = dbRows.Select(x => FormatUtc(x.Date)).ToHashSet();

            var exactDuplicates = preview.Mood
                .Where(x => exactKeys.Contains(GetMoodKey(x)))
                .ToList();

            if (exactDuplicates.Any())
            {
                preview.Mood = preview.Mood
                    .Where(x => !exactKeys.Contains(GetMoodKey(x)))
                    .ToList();

                preview.Warnings.Add($"Mood: {exactDuplicates.Count} row(s) already exist in database and will not be imported.");
            }

            var timestampConflicts = preview.Mood
                .Where(x => timestampKeys.Contains(FormatUtc(x.Date)))
                .ToList();

            if (timestampConflicts.Any())
            {
                preview.Mood = preview.Mood
                    .Where(x => !timestampKeys.Contains(FormatUtc(x.Date)))
                    .ToList();

                preview.Warnings.Add($"Mood: {timestampConflicts.Count} row(s) conflict with an existing record at the same timestamp and will not be imported.");
            }
        }

        private async Task ProcessHydrationDuplicates(ImportPreviewDto preview, string userId)
        {
            var dbRows = await _context.HydrationEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var exactKeys = dbRows.Select(GetHydrationKey).ToHashSet();
            var timestampKeys = dbRows.Select(x => FormatUtc(x.Date)).ToHashSet();

            var exactDuplicates = preview.Hydration
                .Where(x => exactKeys.Contains(GetHydrationKey(x)))
                .ToList();

            if (exactDuplicates.Any())
            {
                preview.Hydration = preview.Hydration
                    .Where(x => !exactKeys.Contains(GetHydrationKey(x)))
                    .ToList();

                preview.Warnings.Add($"Hydration: {exactDuplicates.Count} row(s) already exist in database and will not be imported.");
            }

            var timestampConflicts = preview.Hydration
                .Where(x => timestampKeys.Contains(FormatUtc(x.Date)))
                .ToList();

            if (timestampConflicts.Any())
            {
                preview.Hydration = preview.Hydration
                    .Where(x => !timestampKeys.Contains(FormatUtc(x.Date)))
                    .ToList();

                preview.Warnings.Add($"Hydration: {timestampConflicts.Count} row(s) conflict with an existing record at the same timestamp and will not be imported.");
            }
        }

        private async Task ProcessHabitDuplicates(ImportPreviewDto preview, string userId)
        {
            var dbRows = await _context.HabitEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var exactKeys = dbRows.Select(GetHabitKey).ToHashSet();
            var timestampKeys = dbRows.Select(x => FormatUtc(x.Date)).ToHashSet();

            var exactDuplicates = preview.Habit
                .Where(x => exactKeys.Contains(GetHabitKey(x)))
                .ToList();

            if (exactDuplicates.Any())
            {
                preview.Habit = preview.Habit
                    .Where(x => !exactKeys.Contains(GetHabitKey(x)))
                    .ToList();

                preview.Warnings.Add($"Habit: {exactDuplicates.Count} row(s) already exist in database and will not be imported.");
            }

            var timestampConflicts = preview.Habit
                .Where(x => timestampKeys.Contains(FormatUtc(x.Date)))
                .ToList();

            if (timestampConflicts.Any())
            {
                preview.Habit = preview.Habit
                    .Where(x => !timestampKeys.Contains(FormatUtc(x.Date)))
                    .ToList();

                preview.Warnings.Add($"Habit: {timestampConflicts.Count} row(s) conflict with an existing record at the same timestamp and will not be imported.");
            }
        }

        private async Task ProcessFoodDuplicates(ImportPreviewDto preview, string userId)
        {
            var dbRows = await _context.FoodEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var exactKeys = dbRows.Select(GetFoodKey).ToHashSet();
            var timestampKeys = dbRows.Select(x => FormatUtc(x.Date)).ToHashSet();

            var exactDuplicates = preview.Food
                .Where(x => exactKeys.Contains(GetFoodKey(x)))
                .ToList();

            if (exactDuplicates.Any())
            {
                preview.Food = preview.Food
                    .Where(x => !exactKeys.Contains(GetFoodKey(x)))
                    .ToList();

                preview.Warnings.Add($"Food: {exactDuplicates.Count} row(s) already exist in database and will not be imported.");
            }

            var timestampConflicts = preview.Food
                .Where(x => timestampKeys.Contains(FormatUtc(x.Date)))
                .ToList();

            if (timestampConflicts.Any())
            {
                preview.Food = preview.Food
                    .Where(x => !timestampKeys.Contains(FormatUtc(x.Date)))
                    .ToList();

                preview.Warnings.Add($"Food: {timestampConflicts.Count} row(s) conflict with an existing record at the same timestamp and will not be imported.");
            }
        }

        #region Key Builders

        private string GetStepKey(dynamic x)
            => $"{FormatUtc(x.Date)}|{NormalizeText(x.ActivityType)}|{x.StepsCount}";

        private string GetSleepKey(dynamic x)
            => $"{FormatUtc(x.Date)}|{FormatUtc(x.BedTime)}|{FormatUtc(x.WakeUpTime)}|{NormalizeText(x.Quality)}";

        private string GetMoodKey(dynamic x)
            => $"{FormatUtc(x.Date)}|{NormalizeText(x.Mood)}|{NormalizeNullableText(x.Notes)}";

        private string GetHydrationKey(dynamic x)
            => $"{FormatUtc(x.Date)}|{x.WaterIntakeLiters}";

        private string GetHabitKey(dynamic x)
            => $"{FormatUtc(x.Date)}|{NormalizeText(x.Name)}|{x.Completed}";

        private string GetFoodKey(dynamic x)
            => $"{FormatUtc(x.Date)}|{NormalizeText(x.FoodName)}|{x.Calories}|{x.Protein}|{x.Carbs}|{x.Fat}|{NormalizeText(x.ServingSize)}|{NormalizeText(x.MealType)}";

        #endregion

        #region Sheet Parsers

        private void ParseStepsSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Steps");
            if (sheet == null) return;

            int row = 2;
            while (!sheet.Cell(row, 1).IsEmpty())
            {
                var errors = new List<string>();

                DateTime? date = ParseLocalDateTimeToUtc(sheet.Cell(row, 1).GetValue<string>(), errors, row, "Steps.Date");
                string activity = NormalizeOption(sheet.Cell(row, 2).GetValue<string>() ?? "");
                string stepsCountStr = sheet.Cell(row, 3).GetValue<string>()?.Trim() ?? "";

                int stepsCount = 0;

                if (!new[] { "Running", "Walking", "Hiking", "Cycling" }.Contains(activity))
                    errors.Add($"Row {row}: Invalid ActivityType '{activity}'");

                if (!int.TryParse(stepsCountStr, out stepsCount) || stepsCount < 0)
                    errors.Add($"Row {row}: Invalid StepsCount '{stepsCountStr}'");

                if (errors.Any())
                    preview.Errors.AddRange(errors);
                else
                    preview.Steps.Add(new StepDTO
                    {
                        Date = date,
                        ActivityType = activity,
                        StepsCount = stepsCount
                    });

                row++;
            }
        }

        private void ParseSleepSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Sleep");
            if (sheet == null) return;

            int row = 2;
            while (!sheet.Cell(row, 1).IsEmpty())
            {
                var errors = new List<string>();

                DateTime? dateUtc = ParseLocalDateTimeToUtc(sheet.Cell(row, 1).GetValue<string>(), errors, row, "Sleep.Date");
                DateTime? bedTimeUtc = ParseLocalDateTimeToUtc(sheet.Cell(row, 2).GetValue<string>(), errors, row, "BedTime");
                DateTime? wakeUpTimeUtc = ParseLocalDateTimeToUtc(sheet.Cell(row, 3).GetValue<string>(), errors, row, "WakeUpTime");
                string quality = NormalizeOption(sheet.Cell(row, 5).GetValue<string>() ?? "");

                if (dateUtc == null || bedTimeUtc == null || wakeUpTimeUtc == null)
                {
                    preview.Errors.AddRange(errors);
                    row++;
                    continue;
                }

                double hours = (wakeUpTimeUtc.Value - bedTimeUtc.Value).TotalHours;
                if (hours <= 0 || hours > 24)
                    errors.Add($"Row {row}: Sleep hours '{hours}' out of range (0-24)");

                if (!new[] { "Good", "Average", "Poor" }.Contains(quality))
                    errors.Add($"Row {row}: Invalid Quality '{quality}'");

                if (errors.Any())
                    preview.Errors.AddRange(errors);
                else
                    preview.Sleep.Add(new SleepDTO
                    {
                        Date = dateUtc.Value,
                        BedTime = bedTimeUtc.Value,
                        WakeUpTime = wakeUpTimeUtc.Value,
                        Quality = quality
                    });

                row++;
            }
        }

        private void ParseMoodSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Mood");
            if (sheet == null) return;

            int row = 2;
            while (!sheet.Cell(row, 1).IsEmpty())
            {
                var errors = new List<string>();

                DateTime? date = ParseLocalDateTimeToUtc(sheet.Cell(row, 1).GetValue<string>(), errors, row, "Mood.Date");
                string mood = NormalizeOption(sheet.Cell(row, 2).GetValue<string>() ?? "");
                string? notes = sheet.Cell(row, 3).GetValue<string>()?.Trim();

                if (!new[] { "Happy", "Neutral", "Relaxed", "Sad", "Angry" }.Contains(mood))
                    errors.Add($"Row {row}: Invalid Mood '{mood}'");

                if (errors.Any())
                    preview.Errors.AddRange(errors);
                else
                    preview.Mood.Add(new MoodDTO
                    {
                        Date = date,
                        Mood = mood,
                        Notes = notes
                    });

                row++;
            }
        }

        private void ParseHydrationSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Hydration");
            if (sheet == null) return;

            int row = 2;
            while (!sheet.Cell(row, 1).IsEmpty())
            {
                var errors = new List<string>();

                DateTime? date = ParseLocalDateTimeToUtc(sheet.Cell(row, 1).GetValue<string>(), errors, row, "Hydration.Date");
                string intakeStr = sheet.Cell(row, 2).GetValue<string>()?.Trim() ?? "";

                if (!double.TryParse(intakeStr, out double intake) || intake < 0.1 || intake > 6.0)
                    errors.Add($"Row {row}: Invalid WaterIntakeLiters '{intakeStr}'");

                if (errors.Any())
                    preview.Errors.AddRange(errors);
                else
                    preview.Hydration.Add(new HydrationDTO
                    {
                        Date = date,
                        WaterIntakeLiters = intake
                    });

                row++;
            }
        }

        private void ParseHabitSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Habit");
            if (sheet == null) return;

            int row = 2;
            while (!sheet.Cell(row, 1).IsEmpty())
            {
                var errors = new List<string>();

                DateTime? date = ParseLocalDateTimeToUtc(sheet.Cell(row, 1).GetValue<string>(), errors, row, "Habit.Date");
                string name = sheet.Cell(row, 2).GetValue<string>()?.Trim() ?? "";
                string completedStr = sheet.Cell(row, 3).GetValue<string>()?.Trim().ToLower() ?? "";

                bool completed = completedStr == "true" || completedStr == "yes";

                if (errors.Any())
                    preview.Errors.AddRange(errors);
                else
                    preview.Habit.Add(new HabitDTO
                    {
                        Date = date,
                        Name = name,
                        Completed = completed
                    });

                row++;
            }
        }

        private void ParseFoodSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Food");
            if (sheet == null) return;

            int row = 2;
            while (!sheet.Cell(row, 1).IsEmpty())
            {
                var errors = new List<string>();

                DateTime? date = ParseLocalDateTimeToUtc(sheet.Cell(row, 1).GetValue<string>(), errors, row, "Food.Date");
                string name = sheet.Cell(row, 2).GetValue<string>()?.Trim() ?? "";
                double calories = ParseDouble(sheet.Cell(row, 3).GetValue<string>(), errors, row, "Calories");
                double protein = ParseDouble(sheet.Cell(row, 4).GetValue<string>(), errors, row, "Protein");
                double carbs = ParseDouble(sheet.Cell(row, 5).GetValue<string>(), errors, row, "Carbs");
                double fat = ParseDouble(sheet.Cell(row, 6).GetValue<string>(), errors, row, "Fat");
                string serving = sheet.Cell(row, 7).GetValue<string>()?.Trim() ?? "";
                string meal = NormalizeOption(sheet.Cell(row, 8).GetValue<string>() ?? "");

                if (!new[] { "Breakfast", "Lunch", "Snack", "Dinner" }.Contains(meal))
                    errors.Add($"Row {row}: Invalid MealType '{meal}'");

                if (errors.Any())
                    preview.Errors.AddRange(errors);
                else
                    preview.Food.Add(new FoodEntryDTO
                    {
                        Date = date ?? DateTime.UtcNow,
                        FoodName = name,
                        Calories = calories,
                        Protein = protein,
                        Carbs = carbs,
                        Fat = fat,
                        ServingSize = serving,
                        MealType = meal
                    });

                row++;
            }
        }

        #endregion

        #region Helpers

        private DateTime? ParseLocalDateTimeToUtc(string cellValue, List<string> errors, int row, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(cellValue))
            {
                errors.Add($"Row {row}: {fieldName} is empty");
                return null;
            }

            try
            {
                var localDateTime = DateTime.Parse(cellValue);

                if (localDateTime.Kind == DateTimeKind.Unspecified)
                    localDateTime = DateTime.SpecifyKind(localDateTime, DateTimeKind.Local);

                return localDateTime.ToUniversalTime();
            }
            catch
            {
                errors.Add($"Row {row}: Invalid datetime '{cellValue}' for {fieldName}");
                return null;
            }
        }

        private string FormatUtc(DateTime? dt)
            => dt?.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss") ?? "";

        private double ParseDouble(string cellValue, List<string> errors, int row, string field)
        {
            if (double.TryParse(cellValue, out double val) && val >= 0)
                return val;

            errors.Add($"Row {row}: Invalid {field} '{cellValue}'");
            return 0;
        }

        private string NormalizeOption(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value ?? "";

            value = value.Trim().ToLower();
            return char.ToUpper(value[0]) + value.Substring(1);
        }

        private string NormalizeText(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            return value.Trim().Replace("\r", "").Replace("\n", "").ToLowerInvariant();
        }

        private string NormalizeNullableText(string? value)
            => NormalizeText(value);

        #endregion
    }
}