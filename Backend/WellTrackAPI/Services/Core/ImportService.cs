using System.Globalization;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using WellTrackAPI.Services.Core;

namespace WellTrackAPI.Services.Core
{
    public class ImportService : IImportService
    {
        private readonly ApplicationDbContext _context;

        public ImportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ImportPreviewDto> ParseAndValidateAsync(
            IFormFile file,
            string userId,
            string rangeMode,
            DateTime? from = null,
            DateTime? to = null)
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

            RemoveFutureDatedRows(preview);
            ApplyRange(preview, rangeMode, from, to);
            await BuildOverwriteConflictsAsync(preview, userId);

            return preview;
        }

        public async Task SaveAsync(ImportPreviewDto dto, string userId, bool overwriteConflicts)
        {
            if (dto.Errors.Any())
                throw new InvalidOperationException("Cannot import data with validation errors.");

            await UpsertStepsAsync(dto.Steps, userId, overwriteConflicts);
            await UpsertSleepAsync(dto.Sleep, userId, overwriteConflicts);
            await UpsertMoodAsync(dto.Mood, userId, overwriteConflicts);
            await UpsertHydrationAsync(dto.Hydration, userId, overwriteConflicts);
            await UpsertHabitAsync(dto.Habit, userId, overwriteConflicts);
            await UpsertFoodAsync(dto.Food, userId, overwriteConflicts);

            await _context.SaveChangesAsync();
        }

        private async Task UpsertStepsAsync(IEnumerable<StepDTO> rows, string userId, bool overwriteConflicts)
        {
            var existing = await _context.StepEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var existingByTimestamp = existing.ToDictionary(x => FormatUtc(x.Date), x => x);

            foreach (var row in rows)
            {
                var rowDate = row.Date ?? DateTime.UtcNow;
                var key = FormatUtc(rowDate);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    entity.Date = NormalizeToUtc(rowDate);
                    entity.ActivityType = row.ActivityType;
                    entity.StepsCount = row.StepsCount;
                    continue;
                }

                var newEntity = new StepEntry
                {
                    UserId = userId,
                    Date = NormalizeToUtc(rowDate),
                    ActivityType = row.ActivityType,
                    StepsCount = row.StepsCount
                };

                _context.StepEntries.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task UpsertSleepAsync(IEnumerable<SleepDTO> rows, string userId, bool overwriteConflicts)
        {
            var existing = await _context.SleepEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var existingByTimestamp = existing.ToDictionary(x => FormatUtc(x.Date), x => x);

            foreach (var row in rows)
            {
                var rowDate = row.Date ?? DateTime.UtcNow;
                var key = FormatUtc(rowDate);
                var hours = row.Hours > 0 ? row.Hours : CalculateSleepHours(row.BedTime, row.WakeUpTime);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    entity.Date = NormalizeToUtc(rowDate);
                    entity.BedTime = NormalizeToUtc(row.BedTime);
                    entity.WakeUpTime = NormalizeToUtc(row.WakeUpTime);
                    entity.Hours = hours;
                    entity.Quality = row.Quality;
                    continue;
                }

                var newEntity = new SleepEntry
                {
                    UserId = userId,
                    Date = NormalizeToUtc(rowDate),
                    BedTime = NormalizeToUtc(row.BedTime),
                    WakeUpTime = NormalizeToUtc(row.WakeUpTime),
                    Hours = hours,
                    Quality = row.Quality
                };

                _context.SleepEntries.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task UpsertMoodAsync(IEnumerable<MoodDTO> rows, string userId, bool overwriteConflicts)
        {
            var existing = await _context.MoodEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var existingByTimestamp = existing.ToDictionary(x => FormatUtc(x.Date), x => x);

            foreach (var row in rows)
            {
                var rowDate = row.Date ?? DateTime.UtcNow;
                var key = FormatUtc(rowDate);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    entity.Date = NormalizeToUtc(rowDate);
                    entity.Mood = row.Mood;
                    entity.Notes = row.Notes;
                    continue;
                }

                var newEntity = new MoodEntry
                {
                    UserId = userId,
                    Date = NormalizeToUtc(rowDate),
                    Mood = row.Mood,
                    Notes = row.Notes
                };

                _context.MoodEntries.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task UpsertHydrationAsync(IEnumerable<HydrationDTO> rows, string userId, bool overwriteConflicts)
        {
            var existing = await _context.HydrationEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var existingByTimestamp = existing.ToDictionary(x => FormatUtc(x.Date), x => x);

            foreach (var row in rows)
            {
                var rowDate = row.Date ?? DateTime.UtcNow;
                var key = FormatUtc(rowDate);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    entity.Date = NormalizeToUtc(rowDate);
                    entity.WaterIntakeLiters = row.WaterIntakeLiters;
                    continue;
                }

                var newEntity = new HydrationEntry
                {
                    UserId = userId,
                    Date = NormalizeToUtc(rowDate),
                    WaterIntakeLiters = row.WaterIntakeLiters
                };

                _context.HydrationEntries.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task UpsertHabitAsync(IEnumerable<HabitDTO> rows, string userId, bool overwriteConflicts)
        {
            var existing = await _context.HabitEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var existingByTimestamp = existing.ToDictionary(x => FormatUtc(x.Date), x => x);

            foreach (var row in rows)
            {
                var rowDate = row.Date ?? DateTime.UtcNow;
                var key = FormatUtc(rowDate);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    entity.Date = NormalizeToUtc(rowDate);
                    entity.Name = row.Name;
                    entity.Completed = row.Completed;
                    continue;
                }

                var newEntity = new HabitEntry
                {
                    UserId = userId,
                    Date = NormalizeToUtc(rowDate),
                    Name = row.Name,
                    Completed = row.Completed
                };

                _context.HabitEntries.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task UpsertFoodAsync(IEnumerable<FoodEntryDTO> rows, string userId, bool overwriteConflicts)
        {
            var existing = await _context.FoodEntries
                .Where(x => x.UserId == userId)
                .ToListAsync();

            var existingByTimestamp = existing.ToDictionary(x => FormatUtc(x.Date), x => x);

            foreach (var row in rows)
            {
                if (row.Date == default)
                    throw new InvalidOperationException("Cannot import Food row with missing or default Date.");

                var rowDate = row.Date;
                var key = FormatUtc(rowDate);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    entity.Date = NormalizeToUtc(rowDate);
                    entity.FoodName = row.FoodName;
                    entity.Calories = row.Calories;
                    entity.Protein = row.Protein;
                    entity.Carbs = row.Carbs;
                    entity.Fat = row.Fat;
                    entity.ServingSize = row.ServingSize;
                    entity.MealType = row.MealType;
                    continue;
                }

                var newEntity = new FoodEntry
                {
                    UserId = userId,
                    Date = NormalizeToUtc(rowDate),
                    FoodName = row.FoodName,
                    Calories = row.Calories,
                    Protein = row.Protein,
                    Carbs = row.Carbs,
                    Fat = row.Fat,
                    ServingSize = row.ServingSize,
                    MealType = row.MealType
                };

                _context.FoodEntries.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task BuildOverwriteConflictsAsync(ImportPreviewDto preview, string userId)
        {
            var stepKeys = await _context.StepEntries
                .Where(x => x.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
            var stepKeySet = stepKeys.Select(FormatUtc).ToHashSet();
            preview.OverwriteConflicts.Steps = preview.Steps
                .Where(x => x.Date.HasValue && stepKeySet.Contains(FormatUtc(x.Date.Value)))
                .ToList();

            var sleepKeys = await _context.SleepEntries
                .Where(x => x.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
            var sleepKeySet = sleepKeys.Select(FormatUtc).ToHashSet();
            preview.OverwriteConflicts.Sleep = preview.Sleep
                .Where(x => x.Date.HasValue && sleepKeySet.Contains(FormatUtc(x.Date.Value)))
                .ToList();

            var moodKeys = await _context.MoodEntries
                .Where(x => x.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
            var moodKeySet = moodKeys.Select(FormatUtc).ToHashSet();
            preview.OverwriteConflicts.Mood = preview.Mood
                .Where(x => x.Date.HasValue && moodKeySet.Contains(FormatUtc(x.Date.Value)))
                .ToList();

            var hydrationKeys = await _context.HydrationEntries
                .Where(x => x.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
            var hydrationKeySet = hydrationKeys.Select(FormatUtc).ToHashSet();
            preview.OverwriteConflicts.Hydration = preview.Hydration
                .Where(x => x.Date.HasValue && hydrationKeySet.Contains(FormatUtc(x.Date.Value)))
                .ToList();

            var habitKeys = await _context.HabitEntries
                .Where(x => x.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
            var habitKeySet = habitKeys.Select(FormatUtc).ToHashSet();
            preview.OverwriteConflicts.Habit = preview.Habit
                .Where(x => x.Date.HasValue && habitKeySet.Contains(FormatUtc(x.Date.Value)))
                .ToList();

            var foodKeys = await _context.FoodEntries
                .Where(x => x.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
            var foodKeySet = foodKeys.Select(FormatUtc).ToHashSet();
            preview.OverwriteConflicts.Food = preview.Food
                .Where(x => foodKeySet.Contains(FormatUtc(x.Date)))
                .ToList();

            AddConflictWarning(preview, "Steps", preview.OverwriteConflicts.Steps.Count);
            AddConflictWarning(preview, "Sleep", preview.OverwriteConflicts.Sleep.Count);
            AddConflictWarning(preview, "Mood", preview.OverwriteConflicts.Mood.Count);
            AddConflictWarning(preview, "Hydration", preview.OverwriteConflicts.Hydration.Count);
            AddConflictWarning(preview, "Habit", preview.OverwriteConflicts.Habit.Count);
            AddConflictWarning(preview, "Food", preview.OverwriteConflicts.Food.Count);
        }

        private static void AddConflictWarning(ImportPreviewDto preview, string trackerName, int count)
        {
            if (count <= 0)
                return;

            preview.Warnings.Add($"{trackerName}: {count} row(s) match existing database timestamps and are available as overwrite conflicts.");
        }

        private void RemoveFutureDatedRows(ImportPreviewDto preview)
        {
            var now = DateTime.UtcNow;

            preview.Steps = preview.Steps
                .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value) <= now)
                .ToList();

            preview.Sleep = preview.Sleep
                .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value) <= now)
                .ToList();

            preview.Mood = preview.Mood
                .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value) <= now)
                .ToList();

            preview.Hydration = preview.Hydration
                .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value) <= now)
                .ToList();

            preview.Habit = preview.Habit
                .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value) <= now)
                .ToList();

            preview.Food = preview.Food
                .Where(x => x.Date != default && NormalizeToUtc(x.Date) <= now)
                .ToList();
        }

        private void ApplyRange(ImportPreviewDto preview, string rangeMode, DateTime? from, DateTime? to)
        {
            int beforeCount =
                preview.Steps.Count +
                preview.Sleep.Count +
                preview.Mood.Count +
                preview.Hydration.Count +
                preview.Habit.Count +
                preview.Food.Count;

            if (string.Equals(rangeMode, "all", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(rangeMode))
            {
                return;
            }

            if (string.Equals(rangeMode, "today", StringComparison.OrdinalIgnoreCase))
            {
                var todayUtc = DateTime.UtcNow.Date;

                preview.Steps = preview.Steps
                    .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value).Date == todayUtc)
                    .ToList();

                preview.Sleep = preview.Sleep
                    .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value).Date == todayUtc)
                    .ToList();

                preview.Mood = preview.Mood
                    .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value).Date == todayUtc)
                    .ToList();

                preview.Hydration = preview.Hydration
                    .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value).Date == todayUtc)
                    .ToList();

                preview.Habit = preview.Habit
                    .Where(x => x.Date.HasValue && NormalizeToUtc(x.Date.Value).Date == todayUtc)
                    .ToList();

                preview.Food = preview.Food
                    .Where(x => x.Date != default && NormalizeToUtc(x.Date).Date == todayUtc)
                    .ToList();
            }
            else if (string.Equals(rangeMode, "range", StringComparison.OrdinalIgnoreCase))
            {
                var normalizedFrom = from?.ToUniversalTime();
                var normalizedTo = to?.ToUniversalTime();

                preview.Steps = preview.Steps
                    .Where(x => x.Date.HasValue && IsWithinRange(NormalizeToUtc(x.Date.Value), normalizedFrom, normalizedTo))
                    .ToList();

                preview.Sleep = preview.Sleep
                    .Where(x => x.Date.HasValue && IsWithinRange(NormalizeToUtc(x.Date.Value), normalizedFrom, normalizedTo))
                    .ToList();

                preview.Mood = preview.Mood
                    .Where(x => x.Date.HasValue && IsWithinRange(NormalizeToUtc(x.Date.Value), normalizedFrom, normalizedTo))
                    .ToList();

                preview.Hydration = preview.Hydration
                    .Where(x => x.Date.HasValue && IsWithinRange(NormalizeToUtc(x.Date.Value), normalizedFrom, normalizedTo))
                    .ToList();

                preview.Habit = preview.Habit
                    .Where(x => x.Date.HasValue && IsWithinRange(NormalizeToUtc(x.Date.Value), normalizedFrom, normalizedTo))
                    .ToList();

                preview.Food = preview.Food
                    .Where(x => x.Date != default && IsWithinRange(NormalizeToUtc(x.Date), normalizedFrom, normalizedTo))
                    .ToList();
            }

            int afterCount =
                preview.Steps.Count +
                preview.Sleep.Count +
                preview.Mood.Count +
                preview.Hydration.Count +
                preview.Habit.Count +
                preview.Food.Count;

            int removed = beforeCount - afterCount;
            if (removed > 0)
            {
                preview.Warnings.Add($"{removed} row(s) were excluded because they are outside the selected import range.");
            }
        }

        private static bool IsWithinRange(DateTime value, DateTime? from, DateTime? to)
        {
            if (from.HasValue && value < from.Value)
                return false;

            if (to.HasValue && value > to.Value)
                return false;

            return true;
        }

        private void ParseStepsSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Steps");
            if (sheet == null) return;

            int row = 2;
            while (!IsRowEmpty(sheet, row, 3))
            {
                var errors = new List<string>();

                var date = ReadDateTimeCell(sheet.Cell(row, 1), errors, row, "Steps.Date");
                var activity = NormalizeOption(ReadTextCell(sheet.Cell(row, 2), errors, row, "Steps.ActivityType"));
                var stepsCount = ReadIntegerCell(sheet.Cell(row, 3), errors, row, "Steps.StepsCount");

                if (!new[] { "Running", "Walking", "Hiking", "Cycling" }.Contains(activity))
                    errors.Add($"Row {row}: Invalid ActivityType '{activity}'");

                if (stepsCount < 0)
                    errors.Add($"Row {row}: StepsCount must be >= 0");

                if (errors.Any())
                {
                    preview.Errors.AddRange(errors);
                }
                else
                {
                    preview.Steps.Add(new StepDTO
                    {
                        Date = date,
                        ActivityType = activity,
                        StepsCount = stepsCount
                    });
                }

                row++;
            }
        }

        private void ParseSleepSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Sleep");
            if (sheet == null) return;

            int row = 2;
            while (!IsRowEmpty(sheet, row, 5))
            {
                var errors = new List<string>();

                var date = ReadDateTimeCell(sheet.Cell(row, 1), errors, row, "Sleep.Date");
                var bedTime = ReadDateTimeCell(sheet.Cell(row, 2), errors, row, "Sleep.BedTime");
                var wakeUpTime = ReadDateTimeCell(sheet.Cell(row, 3), errors, row, "Sleep.WakeUpTime");
                var hours = ReadDoubleCell(sheet.Cell(row, 4), errors, row, "Sleep.Hours");
                var quality = NormalizeOption(ReadTextCell(sheet.Cell(row, 5), errors, row, "Sleep.Quality"));

                if (hours <= 0 || hours > 24)
                    errors.Add($"Row {row}: Sleep.Hours '{hours}' must be greater than 0 and at most 24.");

                if (!new[] { "Good", "Average", "Poor" }.Contains(quality))
                    errors.Add($"Row {row}: Invalid Quality '{quality}'");

                if (errors.Any())
                {
                    preview.Errors.AddRange(errors);
                }
                else
                {
                    var calculatedHours = CalculateSleepHours(bedTime!.Value, wakeUpTime!.Value);
                    if (Math.Abs(calculatedHours - hours) > 0.2)
                    {
                        preview.Warnings.Add($"Row {row}: Sleep.Hours value differs from BedTime/WakeUpTime. Calculated value {calculatedHours:F2} will be used.");
                        hours = calculatedHours;
                    }

                    preview.Sleep.Add(new SleepDTO
                    {
                        Date = date,
                        BedTime = bedTime.Value,
                        WakeUpTime = wakeUpTime.Value,
                        Hours = hours,
                        Quality = quality
                    });
                }

                row++;
            }
        }

        private void ParseMoodSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Mood");
            if (sheet == null) return;

            int row = 2;
            while (!IsRowEmpty(sheet, row, 3))
            {
                var errors = new List<string>();

                var date = ReadDateTimeCell(sheet.Cell(row, 1), errors, row, "Mood.Date");
                var mood = NormalizeOption(ReadTextCell(sheet.Cell(row, 2), errors, row, "Mood.Mood"));
                var notes = ReadOptionalTextCell(sheet.Cell(row, 3));

                if (!new[] { "Happy", "Neutral", "Relaxed", "Sad", "Angry" }.Contains(mood))
                    errors.Add($"Row {row}: Invalid Mood '{mood}'");

                if (errors.Any())
                {
                    preview.Errors.AddRange(errors);
                }
                else
                {
                    preview.Mood.Add(new MoodDTO
                    {
                        Date = date,
                        Mood = mood,
                        Notes = notes
                    });
                }

                row++;
            }
        }

        private void ParseHydrationSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Hydration");
            if (sheet == null) return;

            int row = 2;
            while (!IsRowEmpty(sheet, row, 2))
            {
                var errors = new List<string>();

                var date = ReadDateTimeCell(sheet.Cell(row, 1), errors, row, "Hydration.Date");
                var intake = ReadDoubleCell(sheet.Cell(row, 2), errors, row, "Hydration.WaterIntakeLiters");

                if (intake < 0.1 || intake > 6.0)
                    errors.Add($"Row {row}: Invalid WaterIntakeLiters '{intake}'");

                if (errors.Any())
                {
                    preview.Errors.AddRange(errors);
                }
                else
                {
                    preview.Hydration.Add(new HydrationDTO
                    {
                        Date = date,
                        WaterIntakeLiters = intake
                    });
                }

                row++;
            }
        }

        private void ParseHabitSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Habit");
            if (sheet == null) return;

            int row = 2;
            while (!IsRowEmpty(sheet, row, 3))
            {
                var errors = new List<string>();

                var date = ReadDateTimeCell(sheet.Cell(row, 1), errors, row, "Habit.Date");
                var name = ReadTextCell(sheet.Cell(row, 2), errors, row, "Habit.Name");
                var completed = ReadBooleanCell(sheet.Cell(row, 3), errors, row, "Habit.Completed");

                if (errors.Any())
                {
                    preview.Errors.AddRange(errors);
                }
                else
                {
                    preview.Habit.Add(new HabitDTO
                    {
                        Date = date,
                        Name = name,
                        Completed = completed
                    });
                }

                row++;
            }
        }

        private void ParseFoodSheet(XLWorkbook workbook, ImportPreviewDto preview)
        {
            var sheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name == "Food");
            if (sheet == null) return;

            int row = 2;
            while (!IsRowEmpty(sheet, row, 8))
            {
                var errors = new List<string>();

                var date = ReadDateTimeCell(sheet.Cell(row, 1), errors, row, "Food.Date");
                var name = ReadTextCell(sheet.Cell(row, 2), errors, row, "Food.FoodName");
                var calories = ReadDoubleCell(sheet.Cell(row, 3), errors, row, "Food.Calories");
                var protein = ReadDoubleCell(sheet.Cell(row, 4), errors, row, "Food.Protein");
                var carbs = ReadDoubleCell(sheet.Cell(row, 5), errors, row, "Food.Carbs");
                var fat = ReadDoubleCell(sheet.Cell(row, 6), errors, row, "Food.Fat");
                var serving = ReadTextCell(sheet.Cell(row, 7), errors, row, "Food.ServingSize");
                var meal = NormalizeOption(ReadTextCell(sheet.Cell(row, 8), errors, row, "Food.MealType"));

                if (!new[] { "Breakfast", "Lunch", "Snack", "Dinner" }.Contains(meal))
                    errors.Add($"Row {row}: Invalid MealType '{meal}'");

                if (calories < 0 || protein < 0 || carbs < 0 || fat < 0)
                    errors.Add($"Row {row}: Nutrition values must be non-negative.");

                if (errors.Any())
                {
                    preview.Errors.AddRange(errors);
                }
                else
                {
                    preview.Food.Add(new FoodEntryDTO
                    {
                        Date = date!.Value,
                        FoodName = name,
                        Calories = calories,
                        Protein = protein,
                        Carbs = carbs,
                        Fat = fat,
                        ServingSize = serving,
                        MealType = meal
                    });
                }

                row++;
            }
        }

        private static bool IsRowEmpty(IXLWorksheet sheet, int row, int columnCount)
        {
            for (int col = 1; col <= columnCount; col++)
            {
                if (!sheet.Cell(row, col).IsEmpty())
                    return false;
            }

            return true;
        }

        private DateTime? ReadDateTimeCell(IXLCell cell, List<string> errors, int row, string fieldName)
        {
            if (cell.IsEmpty())
            {
                errors.Add($"Row {row}: {fieldName} is empty");
                return null;
            }

            if (cell.DataType == XLDataType.DateTime)
            {
                return NormalizeToUtc(cell.GetDateTime());
            }

            if (cell.DataType == XLDataType.Number)
            {
                try
                {
                    var oaDate = cell.GetDouble();
                    return NormalizeToUtc(DateTime.FromOADate(oaDate));
                }
                catch
                {
                }
            }

            var value = cell.GetValue<string>()?.Trim() ?? string.Empty;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces, out var parsedInvariant))
                return NormalizeToUtc(parsedInvariant);

            if (DateTime.TryParse(value, CultureInfo.CurrentCulture, DateTimeStyles.AllowWhiteSpaces, out var parsedCurrent))
                return NormalizeToUtc(parsedCurrent);

            errors.Add($"Row {row}: Invalid datetime '{value}' for {fieldName}");
            return null;
        }

        private static string ReadTextCell(IXLCell cell, List<string> errors, int row, string fieldName)
        {
            var value = cell.GetValue<string>()?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(value))
            {
                errors.Add($"Row {row}: {fieldName} is empty");
            }

            return value;
        }

        private static string? ReadOptionalTextCell(IXLCell cell)
        {
            var value = cell.GetValue<string>()?.Trim();
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }

        private static int ReadIntegerCell(IXLCell cell, List<string> errors, int row, string fieldName)
        {
            if (cell.IsEmpty())
            {
                errors.Add($"Row {row}: {fieldName} is empty");
                return 0;
            }

            if (cell.DataType == XLDataType.Number)
            {
                var value = cell.GetDouble();
                if (Math.Abs(value - Math.Round(value)) <= 0.000001)
                    return (int)Math.Round(value);

                errors.Add($"Row {row}: {fieldName} must be an integer number");
                return 0;
            }

            var text = cell.GetValue<string>()?.Trim() ?? string.Empty;
            if (int.TryParse(text, NumberStyles.Integer, CultureInfo.InvariantCulture, out var invariantValue))
                return invariantValue;

            if (int.TryParse(text, NumberStyles.Integer, CultureInfo.CurrentCulture, out var currentValue))
                return currentValue;

            errors.Add($"Row {row}: Invalid integer '{text}' for {fieldName}");
            return 0;
        }

        private static double ReadDoubleCell(IXLCell cell, List<string> errors, int row, string fieldName)
        {
            if (cell.IsEmpty())
            {
                errors.Add($"Row {row}: {fieldName} is empty");
                return 0;
            }

            if (cell.DataType == XLDataType.Number)
                return cell.GetDouble();

            var text = cell.GetValue<string>()?.Trim() ?? string.Empty;

            if (double.TryParse(text, NumberStyles.Float | NumberStyles.AllowThousands, CultureInfo.InvariantCulture, out var invariantValue))
                return invariantValue;

            if (double.TryParse(text, NumberStyles.Float | NumberStyles.AllowThousands, CultureInfo.CurrentCulture, out var currentValue))
                return currentValue;

            errors.Add($"Row {row}: Invalid decimal '{text}' for {fieldName}");
            return 0;
        }

        private static bool ReadBooleanCell(IXLCell cell, List<string> errors, int row, string fieldName)
        {
            if (cell.IsEmpty())
            {
                errors.Add($"Row {row}: {fieldName} is empty");
                return false;
            }

            if (cell.DataType == XLDataType.Boolean)
                return cell.GetBoolean();

            if (cell.DataType == XLDataType.Number)
            {
                var value = cell.GetDouble();
                if (Math.Abs(value - 1d) <= 0.000001)
                    return true;
                if (Math.Abs(value) <= 0.000001)
                    return false;

                errors.Add($"Row {row}: Invalid boolean number '{value}' for {fieldName}");
                return false;
            }

            var text = cell.GetValue<string>()?.Trim().ToLowerInvariant() ?? string.Empty;
            if (text is "true" or "yes" or "1")
                return true;
            if (text is "false" or "no" or "0")
                return false;

            errors.Add($"Row {row}: Invalid boolean value '{text}' for {fieldName}");
            return false;
        }

        private static double CalculateSleepHours(DateTime bed, DateTime wake)
        {
            var normalizedBed = NormalizeToUtc(bed);
            var normalizedWake = NormalizeToUtc(wake);

            if (normalizedWake <= normalizedBed)
                normalizedWake = normalizedWake.AddDays(1);

            return Math.Round((normalizedWake - normalizedBed).TotalHours, 2);
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            if (value.Kind == DateTimeKind.Utc)
                return value;

            if (value.Kind == DateTimeKind.Unspecified)
                value = DateTime.SpecifyKind(value, DateTimeKind.Local);

            return value.ToUniversalTime();
        }

        private static string FormatUtc(DateTime value)
            => NormalizeToUtc(value).ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);

        private static string NormalizeOption(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value;

            value = value.Trim().ToLowerInvariant();
            return char.ToUpperInvariant(value[0]) + value.Substring(1);
        }
    }
}