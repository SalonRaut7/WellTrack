import { useEffect, useState } from "react";
import api from "../api/axios";

export const useStepsChart = (range: "week" | "month") => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get(`/api/analytics/steps?range=${range}`)
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