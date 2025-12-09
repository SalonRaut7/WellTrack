import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Heart, Moon, Footprints, Droplets, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";

type Summary = {
  moodAvg: number | null;
  sleepAvg: number | null;
  stepsAvg: number | null;
  hydrationAvg: number | null;
  habitsRate: number | null;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [moodResp, sleepResp, stepsResp, hydrationResp, habitResp] = await Promise.all([
          api.get("/api/mood"),
          api.get("/api/sleep"),
          api.get("/api/steps"),
          api.get("/api/hydration"),
          api.get("/api/habit"),
        ]);
        const since = dayjs().subtract(7, "day");

        const moods = (moodResp.data || []).filter((m: any) => dayjs(m.date).isAfter(since));
        const moodAvg =
          moods.length === 0 ? null : Math.round((moods.reduce((s: any, m: any) => s + (convertMoodToScore(m.mood) || 0), 0) / moods.length) * 100) / 100;

        const sleeps = (sleepResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const sleepAvg = sleeps.length === 0 ? null : Math.round((sleeps.reduce((s: any, it: any) => s + (it.hours || 0), 0) / sleeps.length) * 100) / 100;

        const steps = (stepsResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const stepsAvg = steps.length === 0 ? null : Math.round((steps.reduce((s: any, it: any) => s + (it.stepsCount || 0), 0) / steps.length));

        const hydr = (hydrationResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const hydrationAvg = hydr.length === 0 ? null : Math.round((hydr.reduce((s: any, it: any) => s + (it.waterIntakeLiters || 0), 0) / hydr.length) * 100) / 100;

        const habits = (habitResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const habitsRate = habits.length === 0 ? null : Math.round((habits.reduce((s: any, it: any) => s + (it.completed ? 1 : 0), 0) / habits.length) * 100);

        setSummary({ moodAvg, sleepAvg, stepsAvg, hydrationAvg, habitsRate });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

      {loading && <div>Loading...</div>}

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Mood (avg)" value={summary?.moodAvg ?? "—"} icon={<Heart />} />
        <Card title="Sleep (hours avg)" value={summary?.sleepAvg ?? "—"} icon={<Moon />} />
        <Card title="Steps (avg/day)" value={summary?.stepsAvg ?? "—"} icon={<Footprints />} />
        <Card title="Hydration (L avg)" value={summary?.hydrationAvg ?? "—"} icon={<Droplets />} />
        <Card title="Habits Completed %" value={summary?.habitsRate ?? "—"} icon={<CheckCircle2 />} />
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
  // simple mapping
  const map: Record<string, number> = { happy: 4, relaxed: 3, neutral: 2, sad: 1, angry: 0 };
  return map[m.toLowerCase()] ?? 2;
}
