import { useEffect, useState } from "react";
import api from "../api/axios";

export const useSleepChart = (range: "week" | "month") => {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    api.get(`/api/analytics/sleep?range=${range}`)
      .then(res =>
        setData(
          res.data.map((x: any) => ({
            date: x.date,
            value: x.value
          }))
        )
      );
  }, [range]);

  return data;
};
