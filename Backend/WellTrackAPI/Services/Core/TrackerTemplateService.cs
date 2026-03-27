using ClosedXML.Excel;
using WellTrackAPI.Services.Core;

namespace WellTrackAPI.Services.Core
{
    public class TrackerTemplateService : ITrackerTemplateService
{
    public byte[] GenerateTemplate()
    {
        using var workbook = new XLWorkbook();

        CreateStepsSheet(workbook);
        CreateSleepSheet(workbook);
        CreateMoodSheet(workbook);
        CreateHydrationSheet(workbook);
        CreateHabitSheet(workbook);
        CreateFoodSheet(workbook);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private void CreateStepsSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Steps");

        AddHeaders(sheet, new[] { "Date", "ActivityType", "StepsCount" });

        ApplyDateTimeFormat(sheet.Range("A2:A1000"));
        ApplyIntegerFormat(sheet.Range("C2:C1000"));

        sheet.Range("B2:B1000")
            .CreateDataValidation()
            .List("Walking,Running,Cycling,Hiking");

        var stepsValidation = sheet.Range("C2:C1000").CreateDataValidation();
        stepsValidation.WholeNumber.EqualOrGreaterThan(0);

        FormatSheet(sheet);
    }

    private void CreateSleepSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Sleep");

        AddHeaders(sheet, new[] { "Date", "BedTime", "WakeUpTime", "Hours", "Quality" });

        ApplyDateTimeFormat(sheet.Range("A2:A1000"));
        ApplyDateTimeFormat(sheet.Range("B2:B1000"));
        ApplyDateTimeFormat(sheet.Range("C2:C1000"));
        ApplyDecimalFormat(sheet.Range("D2:D1000"));

        var hoursValidation = sheet.Range("D2:D1000").CreateDataValidation();
        hoursValidation.Decimal.Between(0, 24);

        sheet.Range("E2:E1000")
            .CreateDataValidation()
            .List("Good,Average,Poor");

        FormatSheet(sheet);
    }

    private void CreateMoodSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Mood");

        AddHeaders(sheet, new[] { "Date", "Mood", "Notes" });

        ApplyDateTimeFormat(sheet.Range("A2:A1000"));

        sheet.Range("B2:B1000")
            .CreateDataValidation()
            .List("Happy,Relaxed,Neutral,Sad,Angry");

        FormatSheet(sheet);
    }

    private void CreateHydrationSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Hydration");

        AddHeaders(sheet, new[] { "Date", "WaterIntakeLiters" });

        ApplyDateTimeFormat(sheet.Range("A2:A1000"));
        ApplyDecimalFormat(sheet.Range("B2:B1000"));

        var val = sheet.Range("B2:B1000").CreateDataValidation();
        val.Decimal.Between(0.1, 6.0);

        FormatSheet(sheet);
    }

    private void CreateHabitSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Habit");

        AddHeaders(sheet, new[] { "Date", "Name", "Completed" });

        ApplyDateTimeFormat(sheet.Range("A2:A1000"));

        sheet.Range("C2:C1000")
            .CreateDataValidation()
            .List("TRUE,FALSE");

        FormatSheet(sheet);
    }

    private void CreateFoodSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Food");

        AddHeaders(sheet, new[]
        {
            "Date", "FoodName", "Calories", "Protein",
            "Carbs", "Fat", "ServingSize", "MealType"
        });

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

        FormatSheet(sheet);
    }

    private void AddHeaders(IXLWorksheet sheet, string[] headers)
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

    private void ApplyDateTimeFormat(IXLRange range)
    {
        range.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
    }

    private void ApplyIntegerFormat(IXLRange range)
    {
        range.Style.NumberFormat.Format = "0";
    }

    private void ApplyDecimalFormat(IXLRange range)
    {
        range.Style.NumberFormat.Format = "0.##";
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
