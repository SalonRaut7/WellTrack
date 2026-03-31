using System.Globalization;
using System.Linq.Expressions;
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
        private static readonly HashSet<string> AllowedActivityTypes = new(new[] { "Running", "Walking", "Hiking", "Cycling" }, StringComparer.Ordinal);
        private static readonly HashSet<string> AllowedSleepQualities = new(new[] { "Good", "Average", "Poor" }, StringComparer.Ordinal);
        private static readonly HashSet<string> AllowedMoods = new(new[] { "Happy", "Neutral", "Relaxed", "Sad", "Angry" }, StringComparer.Ordinal);
        private static readonly HashSet<string> AllowedMealTypes = new(new[] { "Breakfast", "Lunch", "Snack", "Dinner" }, StringComparer.Ordinal);

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
            await UpsertByTimestampAsync(
                _context.StepEntries,
                userId,
                rows,
                overwriteConflicts,
                entity => entity.Date,
                row => row.Date,
                (entity, row, normalizedDate) =>
                {
                    entity.Date = normalizedDate;
                    entity.ActivityType = row.ActivityType;
                    entity.StepsCount = row.StepsCount;
                },
                (row, normalizedDate) => new StepEntry
                {
                    UserId = userId,
                    Date = normalizedDate,
                    ActivityType = row.ActivityType,
                    StepsCount = row.StepsCount
                });
        }

        private async Task UpsertSleepAsync(IEnumerable<SleepDTO> rows, string userId, bool overwriteConflicts)
        {
            await UpsertByTimestampAsync(
                _context.SleepEntries,
                userId,
                rows,
                overwriteConflicts,
                entity => entity.Date,
                row => row.Date,
                (entity, row, normalizedDate) =>
                {
                    var hours = row.Hours > 0 ? row.Hours : CalculateSleepHours(row.BedTime, row.WakeUpTime);
                    entity.Date = normalizedDate;
                    entity.BedTime = NormalizeToUtc(row.BedTime);
                    entity.WakeUpTime = NormalizeToUtc(row.WakeUpTime);
                    entity.Hours = hours;
                    entity.Quality = row.Quality;
                },
                (row, normalizedDate) =>
                {
                    var hours = row.Hours > 0 ? row.Hours : CalculateSleepHours(row.BedTime, row.WakeUpTime);
                    return new SleepEntry
                    {
                        UserId = userId,
                        Date = normalizedDate,
                        BedTime = NormalizeToUtc(row.BedTime),
                        WakeUpTime = NormalizeToUtc(row.WakeUpTime),
                        Hours = hours,
                        Quality = row.Quality
                    };
                });
        }

        private async Task UpsertMoodAsync(IEnumerable<MoodDTO> rows, string userId, bool overwriteConflicts)
        {
            await UpsertByTimestampAsync(
                _context.MoodEntries,
                userId,
                rows,
                overwriteConflicts,
                entity => entity.Date,
                row => row.Date,
                (entity, row, normalizedDate) =>
                {
                    entity.Date = normalizedDate;
                    entity.Mood = row.Mood;
                    entity.Notes = row.Notes;
                },
                (row, normalizedDate) => new MoodEntry
                {
                    UserId = userId,
                    Date = normalizedDate,
                    Mood = row.Mood,
                    Notes = row.Notes
                });
        }

        private async Task UpsertHydrationAsync(IEnumerable<HydrationDTO> rows, string userId, bool overwriteConflicts)
        {
            await UpsertByTimestampAsync(
                _context.HydrationEntries,
                userId,
                rows,
                overwriteConflicts,
                entity => entity.Date,
                row => row.Date,
                (entity, row, normalizedDate) =>
                {
                    entity.Date = normalizedDate;
                    entity.WaterIntakeLiters = row.WaterIntakeLiters;
                },
                (row, normalizedDate) => new HydrationEntry
                {
                    UserId = userId,
                    Date = normalizedDate,
                    WaterIntakeLiters = row.WaterIntakeLiters
                });
        }

        private async Task UpsertHabitAsync(IEnumerable<HabitDTO> rows, string userId, bool overwriteConflicts)
        {
            await UpsertByTimestampAsync(
                _context.HabitEntries,
                userId,
                rows,
                overwriteConflicts,
                entity => entity.Date,
                row => row.Date,
                (entity, row, normalizedDate) =>
                {
                    entity.Date = normalizedDate;
                    entity.Name = row.Name;
                    entity.Completed = row.Completed;
                },
                (row, normalizedDate) => new HabitEntry
                {
                    UserId = userId,
                    Date = normalizedDate,
                    Name = row.Name,
                    Completed = row.Completed
                });
        }

        private async Task UpsertFoodAsync(IEnumerable<FoodEntryDTO> rows, string userId, bool overwriteConflicts)
        {
            await UpsertByTimestampAsync(
                _context.FoodEntries,
                userId,
                rows,
                overwriteConflicts,
                entity => entity.Date,
                row => row.Date == default ? null : row.Date,
                (entity, row, normalizedDate) =>
                {
                    entity.Date = normalizedDate;
                    entity.FoodName = row.FoodName;
                    entity.Calories = row.Calories;
                    entity.Protein = row.Protein;
                    entity.Carbs = row.Carbs;
                    entity.Fat = row.Fat;
                    entity.ServingSize = row.ServingSize;
                    entity.MealType = row.MealType;
                },
                (row, normalizedDate) => new FoodEntry
                {
                    UserId = userId,
                    Date = normalizedDate,
                    FoodName = row.FoodName,
                    Calories = row.Calories,
                    Protein = row.Protein,
                    Carbs = row.Carbs,
                    Fat = row.Fat,
                    ServingSize = row.ServingSize,
                    MealType = row.MealType
                },
                throwOnMissingDate: true,
                missingDateMessage: "Cannot import Food row with missing or default Date.");
        }

        private async Task BuildOverwriteConflictsAsync(ImportPreviewDto preview, string userId)
        {
            preview.OverwriteConflicts.Steps = await GetConflictsAsync(
                _context.StepEntries,
                userId,
                preview.Steps,
                entity => entity.Date,
                row => row.Date);

            preview.OverwriteConflicts.Sleep = await GetConflictsAsync(
                _context.SleepEntries,
                userId,
                preview.Sleep,
                entity => entity.Date,
                row => row.Date);

            preview.OverwriteConflicts.Mood = await GetConflictsAsync(
                _context.MoodEntries,
                userId,
                preview.Mood,
                entity => entity.Date,
                row => row.Date);

            preview.OverwriteConflicts.Hydration = await GetConflictsAsync(
                _context.HydrationEntries,
                userId,
                preview.Hydration,
                entity => entity.Date,
                row => row.Date);

            preview.OverwriteConflicts.Habit = await GetConflictsAsync(
                _context.HabitEntries,
                userId,
                preview.Habit,
                entity => entity.Date,
                row => row.Date);

            preview.OverwriteConflicts.Food = await GetConflictsAsync(
                _context.FoodEntries,
                userId,
                preview.Food,
                entity => entity.Date,
                row => row.Date);

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

        //removes rows with future dates (compared to current UTC time) - for all trackers, adds warning if any rows were removed
        private void RemoveFutureDatedRows(ImportPreviewDto preview)
        {
            var now = DateTime.UtcNow;

            preview.Steps = FilterNonFutureNullable(preview.Steps, x => x.Date, now);
            preview.Sleep = FilterNonFutureNullable(preview.Sleep, x => x.Date, now);
            preview.Mood = FilterNonFutureNullable(preview.Mood, x => x.Date, now);
            preview.Hydration = FilterNonFutureNullable(preview.Hydration, x => x.Date, now);
            preview.Habit = FilterNonFutureNullable(preview.Habit, x => x.Date, now);
            preview.Food = FilterNonFutureNonDefault(preview.Food, x => x.Date, now);
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

                preview.Steps = FilterByUtcDate(preview.Steps, x => x.Date, todayUtc);
                preview.Sleep = FilterByUtcDate(preview.Sleep, x => x.Date, todayUtc);
                preview.Mood = FilterByUtcDate(preview.Mood, x => x.Date, todayUtc);
                preview.Hydration = FilterByUtcDate(preview.Hydration, x => x.Date, todayUtc);
                preview.Habit = FilterByUtcDate(preview.Habit, x => x.Date, todayUtc);
                preview.Food = FilterByUtcDate(preview.Food, x => x.Date == default ? null : x.Date, todayUtc);
            }
            else if (string.Equals(rangeMode, "range", StringComparison.OrdinalIgnoreCase))
            {
                var normalizedFrom = from?.ToUniversalTime();
                var normalizedTo = to?.ToUniversalTime();

                preview.Steps = FilterByRange(preview.Steps, x => x.Date, normalizedFrom, normalizedTo);
                preview.Sleep = FilterByRange(preview.Sleep, x => x.Date, normalizedFrom, normalizedTo);
                preview.Mood = FilterByRange(preview.Mood, x => x.Date, normalizedFrom, normalizedTo);
                preview.Hydration = FilterByRange(preview.Hydration, x => x.Date, normalizedFrom, normalizedTo);
                preview.Habit = FilterByRange(preview.Habit, x => x.Date, normalizedFrom, normalizedTo);
                preview.Food = FilterByRange(preview.Food, x => x.Date == default ? null : x.Date, normalizedFrom, normalizedTo);
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

        private async Task UpsertByTimestampAsync<TEntity, TRow>(
            DbSet<TEntity> set,
            string userId,
            IEnumerable<TRow> rows,
            bool overwriteConflicts,
            Func<TEntity, DateTime> entityDateSelector,
            Func<TRow, DateTime?> rowDateSelector,
            Action<TEntity, TRow, DateTime> updateEntity,
            Func<TRow, DateTime, TEntity> createEntity,
            bool throwOnMissingDate = false,
            string? missingDateMessage = null)
            where TEntity : class
        {
            var existing = await set
                .Where(x => EF.Property<string>(x, "UserId") == userId)
                .ToListAsync();

            var existingByTimestamp = new Dictionary<string, TEntity>(StringComparer.Ordinal);
            foreach (var entity in existing)
            {
                var key = FormatUtc(entityDateSelector(entity));
                if (!existingByTimestamp.ContainsKey(key))
                {
                    existingByTimestamp[key] = entity;
                }
            }

            foreach (var row in rows)
            {
                var rowDate = rowDateSelector(row);
                if (!rowDate.HasValue)
                {
                    if (throwOnMissingDate)
                        throw new InvalidOperationException(missingDateMessage ?? "Missing Date in import row.");

                    rowDate = DateTime.UtcNow;
                }

                var key = FormatUtc(rowDate.Value);
                var normalizedDate = NormalizeToUtc(rowDate.Value);

                if (existingByTimestamp.TryGetValue(key, out var entity))
                {
                    if (!overwriteConflicts)
                        continue;

                    updateEntity(entity, row, normalizedDate);
                    continue;
                }

                var newEntity = createEntity(row, normalizedDate);
                set.Add(newEntity);
                existingByTimestamp[key] = newEntity;
            }
        }

        private async Task<List<TDto>> GetConflictsAsync<TEntity, TDto>(
            DbSet<TEntity> set,
            string userId,
            IEnumerable<TDto> rows,
            Expression<Func<TEntity, DateTime>> entityDateSelector,
            Func<TDto, DateTime?> rowDateSelector)
            where TEntity : class
        {
            var keys = await set
                .Where(x => EF.Property<string>(x, "UserId") == userId)
                .Select(entityDateSelector)
                .ToListAsync();

            var keySet = keys.Select(FormatUtc).ToHashSet();
            return rows
                .Where(x => rowDateSelector(x).HasValue && keySet.Contains(FormatUtc(rowDateSelector(x)!.Value)))
                .ToList();
        }

        //removes rows with future dates (compared to current UTC time) - for nullable date selectors
        private static List<T> FilterNonFutureNullable<T>(IEnumerable<T> rows, Func<T, DateTime?> dateSelector, DateTime nowUtc)
        {
            return rows
                .Where(x =>
                {
                    var date = dateSelector(x);
                    return date.HasValue && NormalizeToUtc(date.Value) <= nowUtc;
                })
                .ToList();
        }
        //removes rows with future dates (compared to current UTC time) - for non-nullable date selectors where default value is considered missing
        private static List<T> FilterNonFutureNonDefault<T>(IEnumerable<T> rows, Func<T, DateTime> dateSelector, DateTime nowUtc)
        {
            return rows
                .Where(x =>
                {
                    var date = dateSelector(x);
                    return date != default && NormalizeToUtc(date) <= nowUtc;
                })
                .ToList();
        }

        private static List<T> FilterByUtcDate<T>(IEnumerable<T> rows, Func<T, DateTime?> dateSelector, DateTime targetDateUtc)
        {
            return rows
                .Where(x =>
                {
                    var date = dateSelector(x);
                    return date.HasValue && NormalizeToUtc(date.Value).Date == targetDateUtc;
                })
                .ToList();
        }

        private static List<T> FilterByRange<T>(
            IEnumerable<T> rows,
            Func<T, DateTime?> dateSelector,
            DateTime? from,
            DateTime? to)
        {
            return rows
                .Where(x =>
                {
                    var date = dateSelector(x);
                    return date.HasValue && IsWithinRange(NormalizeToUtc(date.Value), from, to);
                })
                .ToList();
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

                if (!AllowedActivityTypes.Contains(activity))
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

                if (!AllowedSleepQualities.Contains(quality))
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

                if (!AllowedMoods.Contains(mood))
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

                if (!AllowedMealTypes.Contains(meal))
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