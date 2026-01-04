import { useEffect, useState } from "react";
import api from "../api/axios";

type ChartPoint = {
  date: string;
  value: number;
};

type FoodChartResponse = {
  calories: ChartPoint[];
  protein: ChartPoint[];
  carbs: ChartPoint[];
  fat: ChartPoint[];
};

export const useFoodChart = (range: "week" | "month") => {
  const [data, setData] = useState<FoodChartResponse | null>(null);

  useEffect(() => {
    api
      .get(`/api/analytics/food?range=${range}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Food chart error", err));
  }, [range]);

  return data;
};
