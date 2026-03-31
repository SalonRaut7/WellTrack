using ClosedXML.Excel;
using WellTrackAPI.Services.Core;

namespace WellTrackAPI.Services.Core
{
    public class TrackerTemplateService : ITrackerTemplateService
    {
        public byte[] GenerateTemplate()
        {
            using var workbook = new XLWorkbook();

            CreateSheet(workbook, "Steps", new[] { "Date", "ActivityType", "StepsCount" }, ConfigureStepsSheet);
            CreateSheet(workbook, "Sleep", new[] { "Date", "BedTime", "WakeUpTime", "Hours", "Quality" }, ConfigureSleepSheet);
            CreateSheet(workbook, "Mood", new[] { "Date", "Mood", "Notes" }, ConfigureMoodSheet);
            CreateSheet(workbook, "Hydration", new[] { "Date", "WaterIntakeLiters" }, ConfigureHydrationSheet);
            CreateSheet(workbook, "Habit", new[] { "Date", "Name", "Completed" }, ConfigureHabitSheet);
            CreateSheet(workbook, "Food", new[]
            {
                "Date", "FoodName", "Calories", "Protein",
                "Carbs", "Fat", "ServingSize", "MealType"
            }, ConfigureFoodSheet);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static void CreateSheet(
            XLWorkbook workbook,
            string name,
            string[] headers,
            Action<IXLWorksheet> configure)
        {
            var sheet = workbook.AddWorksheet(name);
            AddHeaders(sheet, headers);
            configure(sheet);
            FormatSheet(sheet);
        }

        private static void ConfigureStepsSheet(IXLWorksheet sheet)
        {
            ApplyDateTimeFormat(sheet.Range("A2:A1000"));
            ApplyIntegerFormat(sheet.Range("C2:C1000"));

            sheet.Range("B2:B1000")
                .CreateDataValidation()
                .List("Walking,Running,Cycling,Hiking");

            var stepsValidation = sheet.Range("C2:C1000").CreateDataValidation();
            stepsValidation.WholeNumber.EqualOrGreaterThan(0);
        }

        private static void ConfigureSleepSheet(IXLWorksheet sheet)
        {
            ApplyDateTimeFormat(sheet.Range("A2:A1000"));
            ApplyDateTimeFormat(sheet.Range("B2:B1000"));
            ApplyDateTimeFormat(sheet.Range("C2:C1000"));
            ApplyDecimalFormat(sheet.Range("D2:D1000"));

            var hoursValidation = sheet.Range("D2:D1000").CreateDataValidation();
            hoursValidation.Decimal.Between(0, 24);

            sheet.Range("E2:E1000")
                .CreateDataValidation()
                .List("Good,Average,Poor");
        }

        private static void ConfigureMoodSheet(IXLWorksheet sheet)
        {
            ApplyDateTimeFormat(sheet.Range("A2:A1000"));

            sheet.Range("B2:B1000")
                .CreateDataValidation()
                .List("Happy,Relaxed,Neutral,Sad,Angry");
        }

        private static void ConfigureHydrationSheet(IXLWorksheet sheet)
        {
            ApplyDateTimeFormat(sheet.Range("A2:A1000"));
            ApplyDecimalFormat(sheet.Range("B2:B1000"));

            var validation = sheet.Range("B2:B1000").CreateDataValidation();
            validation.Decimal.Between(0.1, 6.0);
        }

        private static void ConfigureHabitSheet(IXLWorksheet sheet)
        {
            ApplyDateTimeFormat(sheet.Range("A2:A1000"));

            sheet.Range("C2:C1000")
                .CreateDataValidation()
                .List("TRUE,FALSE");
        }

        private static void ConfigureFoodSheet(IXLWorksheet sheet)
        {
            ApplyDateTimeFormat(sheet.Range("A2:A1000"));
            ApplyDecimalFormat(sheet.Range("C2:C1000"));
            ApplyDecimalFormat(sheet.Range("D2:D1000"));
            ApplyDecimalFormat(sheet.Range("E2:E1000"));
            ApplyDecimalFormat(sheet.Range("F2:F1000"));

            sheet.Range("H2:H1000")
                .CreateDataValidation()
                .List("Breakfast,Lunch,Snack,Dinner");

            var caloriesValidation = sheet.Range("C2:C1000").CreateDataValidation();
            caloriesValidation.Decimal.EqualOrGreaterThan(0);

            var proteinValidation = sheet.Range("D2:D1000").CreateDataValidation();
            proteinValidation.Decimal.EqualOrGreaterThan(0);

            var carbsValidation = sheet.Range("E2:E1000").CreateDataValidation();
            carbsValidation.Decimal.EqualOrGreaterThan(0);

            var fatValidation = sheet.Range("F2:F1000").CreateDataValidation();
            fatValidation.Decimal.EqualOrGreaterThan(0);
        }

        private static void AddHeaders(IXLWorksheet sheet, string[] headers)
        {
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
            }
        }

        private static void ApplyDateTimeFormat(IXLRange range)
        {
            range.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
        }

        private static void ApplyIntegerFormat(IXLRange range)
        {
            range.Style.NumberFormat.Format = "0";
        }

        private static void ApplyDecimalFormat(IXLRange range)
        {
            range.Style.NumberFormat.Format = "0.##";
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
    }
}
