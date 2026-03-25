using ClosedXML.Excel;

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

        var headers = new[] { "Date", "ActivityType", "StepsCount" };
        AddHeaders(sheet, headers);

        var range = sheet.Range("B2:B1000");
        var validation = range.CreateDataValidation();
        validation.List("Walking,Running,Cycling,Hiking");

        FormatSheet(sheet);
    }
    private void CreateSleepSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Sleep");

        AddHeaders(sheet, new[] { "Date", "BedTime", "WakeUpTime", "Hours", "Quality" });

        var range = sheet.Range("E2:E1000");
        range.CreateDataValidation().List("Good,Average,Poor");

        FormatSheet(sheet);
    }
    private void CreateMoodSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Mood");

        AddHeaders(sheet, new[] { "Date", "Mood", "Notes" });

        sheet.Range("B2:B1000")
            .CreateDataValidation()
            .List("Happy,Relaxed,Neutral,Sad,Angry");

        FormatSheet(sheet);
    }
    private void CreateHydrationSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Hydration");

        AddHeaders(sheet, new[] { "Date", "WaterIntakeLiters" });

        var range = sheet.Range("B2:B1000");
        var val = range.CreateDataValidation();
        val.Decimal.Between(0.1, 6.0); // liters

        FormatSheet(sheet);
    }

    private void CreateHabitSheet(XLWorkbook wb)
    {
        var sheet = wb.AddWorksheet("Habit");

        AddHeaders(sheet, new[] { "Date", "Name", "Completed" });

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

        sheet.Range("H2:H1000")
            .CreateDataValidation()
            .List("Breakfast,Lunch,Snack,Dinner");

        FormatSheet(sheet);
    }
    private void AddHeaders(IXLWorksheet sheet, string[] headers)
    {
        for (int i = 0; i < headers.Length; i++)
        {
            sheet.Cell(1, i + 1).Value = headers[i];
        }
    }

    private void FormatSheet(IXLWorksheet sheet)
    {
        sheet.Row(1).Style.Font.Bold = true;
        sheet.Columns().AdjustToContents();
    }
}