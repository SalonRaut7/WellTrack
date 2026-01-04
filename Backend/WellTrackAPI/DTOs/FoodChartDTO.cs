using System.Collections.Generic;

namespace WellTrackAPI.DTOs;

public class FoodChartDTO
{
    public List<ChartPointDTO> Calories { get; set; } = [];
    public List<ChartPointDTO> Protein { get; set; } = [];
    public List<ChartPointDTO> Carbs { get; set; } = [];
    public List<ChartPointDTO> Fat { get; set; } = [];
}
