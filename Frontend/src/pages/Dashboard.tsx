import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Heart, Moon, Footprints, Droplets, CheckCircle2, Utensils } from "lucide-react";
import dayjs from "dayjs";

type Summary = {
  mood: { emoji: string; text: string } | null;
  sleepAvg: number | null;
  stepsAvg: number | null;
  hydrationAvg: number | null;
  habitsRate: number | null;
  caloriesAvg: number | null;
  proteinAvg: number | null;
  carbsAvg: number | null;
  fatAvg: number | null;
};

type View = "daily" | "weekly" | "monthly";

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("weekly");

  const getDaysCount = () => {
    switch (view) {
      case "daily": return 1;
      case "weekly": return 7;
      case "monthly": return 30;
      default: return 7;
    }
  };

  const getStartDate = () => {
    switch (view) {
      case "daily": return dayjs().startOf("day");
      case "weekly": return dayjs().subtract(7, "day");
      case "monthly": return dayjs().subtract(30, "day");
      default: return dayjs().subtract(7, "day");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          moodResp,
          sleepResp,
          stepsResp,
          hydrationResp,
          habitResp,
          foodResp 
        ] = await Promise.all([
          api.get("/api/mood"),
          api.get("/api/sleep"),
          api.get("/api/steps"),
          api.get("/api/hydration"),
          api.get("/api/habit"),
          api.get("/api/foodlog/today")
        ]);

        const since = getStartDate();
        const daysCount = getDaysCount();
        const moods = (moodResp.data || []).filter((m: any) =>
          dayjs(m.date).isAfter(since)
        );

        const moodAvgNum = moods.length === 0
          ? null
          : moods.reduce((s: number, m: any) =>
              s + (convertMoodToScore(m.mood) || 0), 0
            ) / moods.length;

        const mood = moodAvgNum !== null
          ? moodToEmojiText(moodAvgNum)
          : null;

        const sleeps = (sleepResp.data || []).filter((s: any) =>
          dayjs(s.date).isAfter(since)
        );
        const totalSleep = sleeps.reduce((s: number, it: any) =>
          s + (it.hours || 0), 0
        );
        const sleepAvg = sleeps.length === 0
          ? null
          : Math.round((totalSleep / daysCount) * 100) / 100;

        const steps = (stepsResp.data || []).filter((s: any) =>
          dayjs(s.date).isAfter(since)
        );
        const totalSteps = steps.reduce((s: number, it: any) =>
          s + (it.stepsCount || 0), 0
        );
        const stepsAvg = steps.length === 0
          ? null
          : Math.round(totalSteps / daysCount);

        const hydr = (hydrationResp.data || []).filter((s: any) =>
          dayjs(s.date).isAfter(since)
        );
        const totalHydration = hydr.reduce((s: number, it: any) =>
          s + (it.waterIntakeLiters || 0), 0
        );
        const hydrationAvg = hydr.length === 0
          ? null
          : Math.round((totalHydration / daysCount) * 100) / 100;

        const habits = (habitResp.data || []).filter((s: any) =>
          dayjs(s.date).isAfter(since)
        );
        const habitsRate = habits.length === 0
          ? null
          : Math.round(
              (habits.reduce((s: number, it: any) =>
                s + (it.completed ? 1 : 0), 0
              ) / habits.length) * 100
            );

        const foodEntries = foodResp.data?.entries || [];

        const foodFiltered = foodEntries.filter((f: any) =>
          dayjs(f.date).isAfter(since)
        );

        const foodTotals = foodFiltered.reduce(
          (acc: any, f: any) => {
            acc.calories += f.calories || 0;
            acc.protein += f.protein || 0;
            acc.carbs += f.carbs || 0;
            acc.fat += f.fat || 0;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        const caloriesAvg = foodFiltered.length === 0
          ? null
          : Math.round(foodTotals.calories / daysCount);

        const proteinAvg = foodFiltered.length === 0
          ? null
          : Math.round(foodTotals.protein / daysCount);

        const carbsAvg = foodFiltered.length === 0
          ? null
          : Math.round(foodTotals.carbs / daysCount);

        const fatAvg = foodFiltered.length === 0
          ? null
          : Math.round(foodTotals.fat / daysCount);

        setSummary({
          mood,
          sleepAvg,
          stepsAvg,
          hydrationAvg,
          habitsRate,
          caloriesAvg,
          proteinAvg,
          carbsAvg,
          fatAvg
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [view]);

  const unitLabel = () => {
    switch (view) {
      case "daily": return "avg/day";
      case "weekly": return "avg/week";
      case "monthly": return "avg/month";
      default: return "avg";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>

      <div className="mb-6 flex gap-3">
        {["daily", "weekly", "monthly"].map(v => (
          <button
            key={v}
            onClick={() => setView(v as View)}
            className={`px-4 py-2 rounded ${
              view === v ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div>Loading...</div>}

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Mood (avg)" value={summary?.mood ? `${summary.mood.emoji} ${summary.mood.text}` : "—"} icon={<Heart />} />
        <Card title={`Sleep (${unitLabel()})`} value={summary?.sleepAvg ?? "—"} icon={<Moon />} />
        <Card title={`Steps (${unitLabel()})`} value={summary?.stepsAvg ?? "—"} icon={<Footprints />} />
        <Card title={`Hydration (${unitLabel()})`} value={summary?.hydrationAvg ?? "—"} icon={<Droplets />} />
        <Card title="Habits Completed %" value={summary?.habitsRate ?? "—"} icon={<CheckCircle2 />} />

        <Card title={`Calories (${unitLabel()})`} value={summary?.caloriesAvg ?? "—"} icon={<Utensils />} />
        <Card title={`Protein (${unitLabel()})`} value={summary?.proteinAvg ?? "—"} icon={<Utensils />} />
        <Card title={`Carbs (${unitLabel()})`} value={summary?.carbsAvg ?? "—"} icon={<Utensils />} />
        <Card title={`Fat (${unitLabel()})`} value={summary?.fatAvg ?? "—"} icon={<Utensils />} />
      </div>
    </div>
  );
}

function Card({ title, value, icon }: { title: string; value: any; icon?: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
      <div className="p-3 rounded-lg bg-blue-50">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function convertMoodToScore(m: string) {
  const map: Record<string, number> = { happy: 4, relaxed: 3, neutral: 2, sad: 1, angry: 0 };
  return map[m.toLowerCase()] ?? 2;
}

function moodToEmojiText(avg: number) {
  if (avg < 0.5) return { emoji: "😡", text: "Angry" };
  if (avg < 1.5) return { emoji: "😢", text: "Sad" };
  if (avg < 2.5) return { emoji: "😐", text: "Neutral" };
  if (avg < 3.5) return { emoji: "🙂", text: "Relaxed" };
  return { emoji: "😄", text: "Happy" };
}
