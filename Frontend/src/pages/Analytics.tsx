import { useEffect, useState } from "react";
import api from "../api/axios";
import aiApi from "../api/aiApi";

type PredictResult = {
  summary: string;
  action_items: string[];
};

export default function Analytics() {
  const [prediction, setPrediction] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch latest user data from backend
        const [
          habitResp,
          moodResp,
          sleepResp,
          stepsResp,
          hydrationResp,
          foodResp,
        ] = await Promise.all([
          api.get("/api/habit"),
          api.get("/api/mood"),
          api.get("/api/sleep"),
          api.get("/api/steps"),
          api.get("/api/hydration"),
          api.get("/api/foodlog/today"),
        ]);

        const latestHabit = habitResp.data?.[0] || {};
        const latestMood = moodResp.data?.[0] || {};
        const latestSleep = sleepResp.data?.[0] || {};
        const latestSteps = stepsResp.data?.[0] || {};
        const latestHydration = hydrationResp.data?.[0] || {};
        const foodEntries = foodResp.data?.entries || [];

        const totalFood = foodEntries.reduce(
          (acc: any, f: any) => {
            acc.calories += f.calories || 0;
            acc.protein += f.protein || 0;
            acc.carbs += f.carbs || 0;
            acc.fat += f.fat || 0;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        const payload = {
          habit: {
            previous_habit_ratio: latestHabit.ratio || 0,
          },
          mood: {
            value: latestMood.value || 1,
            activity_type: latestMood.activity_type || 0,
          },
          sleep: {
            hours: latestSleep.hours || 0,
            quality: latestSleep.quality || 1,
          },
          steps: latestSteps.stepsCount || 0,
          water_liters: latestHydration.waterIntakeLiters || 0,
          calories: totalFood.calories,
          protein: totalFood.protein,
          carbs: totalFood.carbs,
          fat: totalFood.fat,
        };

        const predResp = await aiApi.post("/predict/predict-all", payload);
        setPrediction(predResp.data);
      } catch (err: any) {
        console.error("Prediction API error:", err);
        setError("Failed to fetch AI predictions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">AI Prediction & Recommendations</h2>

      {loading && <div>Loading predictions...</div>}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {prediction && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Summary</h3>
            <p>{prediction.summary}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Action Items</h3>
            <ul className="list-disc list-inside space-y-1">
              {prediction.action_items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
