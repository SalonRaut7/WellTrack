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

type DailyMotivation = {
  date: string;
  message: string;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("weekly");

  // Daily motivation (independent of summary loading)
  const [motivation, setMotivation] = useState<DailyMotivation | null>(null);
  const [motivationLoading, setMotivationLoading] = useState(false);
  const [motivationError, setMotivationError] = useState<string | null>(null);

  const getDaysCount = () => {
    switch (view) {
      case "daily":
        return 1;
      case "weekly":
        return 7;
      case "monthly":
        return 30;
      default:
        return 7;
    }
  };

  const getStartDate = () => {
    switch (view) {
      case "daily":
        return dayjs().startOf("day");
      case "weekly":
        return dayjs().subtract(7, "day");
      case "monthly":
        return dayjs().subtract(30, "day");
      default:
        return dayjs().subtract(7, "day");
    }
  };

  // Load Daily Motivation once on page load
  useEffect(() => {
    const loadMotivation = async () => {
      setMotivationLoading(true);
      setMotivationError(null);
      try {
        const resp = await api.get("/api/motivation/today", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setMotivation(resp.data);
      } catch (err: any) {
        setMotivationError(err?.response?.data?.message || "Failed to load daily motivation.");
      } finally {
        setMotivationLoading(false);
      }
    };

    loadMotivation();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [moodResp, sleepResp, stepsResp, hydrationResp, habitResp, foodResp] = await Promise.all([
          api.get("/api/mood"),
          api.get("/api/sleep"),
          api.get("/api/steps"),
          api.get("/api/hydration"),
          api.get("/api/habit"),
          api.get("/api/foodlog/today"),
        ]);

        const since = getStartDate();
        const daysCount = getDaysCount();
        const moods = (moodResp.data || []).filter((m: any) => dayjs(m.date).isAfter(since));

        const moodAvgNum =
          moods.length === 0
            ? null
            : moods.reduce((s: number, m: any) => s + (convertMoodToScore(m.mood) || 0), 0) / moods.length;

        const mood = moodAvgNum !== null ? moodToEmojiText(moodAvgNum) : null;

        const sleeps = (sleepResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const totalSleep = sleeps.reduce((s: number, it: any) => s + (it.hours || 0), 0);
        const sleepAvg = sleeps.length === 0 ? null : Math.round((totalSleep / daysCount) * 100) / 100;

        const steps = (stepsResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const totalSteps = steps.reduce((s: number, it: any) => s + (it.stepsCount || 0), 0);
        const stepsAvg = steps.length === 0 ? null : Math.round(totalSteps / daysCount);

        const hydr = (hydrationResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const totalHydration = hydr.reduce((s: number, it: any) => s + (it.waterIntakeLiters || 0), 0);
        const hydrationAvg = hydr.length === 0 ? null : Math.round((totalHydration / daysCount) * 100) / 100;

        const habits = (habitResp.data || []).filter((s: any) => dayjs(s.date).isAfter(since));
        const habitsRate =
          habits.length === 0
            ? null
            : Math.round((habits.reduce((s: number, it: any) => s + (it.completed ? 1 : 0), 0) / habits.length) * 100);

        const foodEntries = foodResp.data?.entries || [];
        const foodFiltered = foodEntries.filter((f: any) => dayjs(f.date).isAfter(since));

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

        const caloriesAvg = foodFiltered.length === 0 ? null : Math.round(foodTotals.calories / daysCount);
        const proteinAvg = foodFiltered.length === 0 ? null : Math.round(foodTotals.protein / daysCount);
        const carbsAvg = foodFiltered.length === 0 ? null : Math.round(foodTotals.carbs / daysCount);
        const fatAvg = foodFiltered.length === 0 ? null : Math.round(foodTotals.fat / daysCount);

        setSummary({
          mood,
          sleepAvg,
          stepsAvg,
          hydrationAvg,
          habitsRate,
          caloriesAvg,
          proteinAvg,
          carbsAvg,
          fatAvg,
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
      case "daily":
        return "avg/day";
      case "weekly":
        return "avg/week";
      case "monthly":
        return "avg/month";
      default:
        return "avg";
    }
  };

  const rangeLabel = () => {
    switch (view) {
      case "daily":
        return "Today";
      case "weekly":
        return "Last 7 days";
      case "monthly":
        return "Last 30 days";
      default:
        return "Overview";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 opacity-15" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h2>
                <p className="mt-1 text-sm text-slate-500">Your health summary · {rangeLabel()}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["daily", "weekly", "monthly"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      "border shadow-sm",
                      view === v
                        ? "border-indigo-200 bg-indigo-600 text-white shadow-indigo-100"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 opacity-10" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Daily motivation</div>
                <div className="mt-1 text-xs text-slate-600">
                  {motivation?.date ? `For ${motivation.date}` : "For today"}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                  {motivationLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-9/12 animate-pulse rounded bg-slate-200" />
                    </div>
                  ) : motivationError ? (
                    <div className="text-rose-700">{motivationError}</div>
                  ) : motivation?.message ? (
                    <div className="leading-relaxed">{motivation.message}</div>
                  ) : (
                    <div className="text-slate-500">No motivation available yet.</div>
                  )}
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                Motivation
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Mood (avg)"
            subtitle={unitLabel()}
            value={
              summary?.mood ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-3xl">{summary.mood.emoji}</span>
                  <span className="text-slate-900">{summary.mood.text}</span>
                </span>
              ) : (
                "—"
              )
            }
            icon={<Heart className="h-5 w-5" />}
            gradient="from-fuchsia-600 to-pink-500"
            chipClass="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100"
            loading={loading}
          />

          <Card
            title="Sleep"
            subtitle={unitLabel()}
            value={summary?.sleepAvg ?? "—"}
            icon={<Moon className="h-5 w-5" />}
            gradient="from-slate-800 to-indigo-600"
            chipClass="bg-indigo-50 text-indigo-700 border-indigo-100"
            loading={loading}
            suffix={summary?.sleepAvg !== null ? " hrs" : ""}
          />

          <Card
            title="Steps"
            subtitle={unitLabel()}
            value={summary?.stepsAvg ?? "—"}
            icon={<Footprints className="h-5 w-5" />}
            gradient="from-emerald-600 to-lime-500"
            chipClass="bg-emerald-50 text-emerald-700 border-emerald-100"
            loading={loading}
          />

          <Card
            title="Hydration"
            subtitle={unitLabel()}
            value={summary?.hydrationAvg ?? "—"}
            icon={<Droplets className="h-5 w-5" />}
            gradient="from-sky-600 to-cyan-500"
            chipClass="bg-sky-50 text-sky-700 border-sky-100"
            loading={loading}
            suffix={summary?.hydrationAvg !== null ? " L" : ""}
          />

          <Card
            title="Habits Completed"
            subtitle="%"
            value={summary?.habitsRate ?? "—"}
            icon={<CheckCircle2 className="h-5 w-5" />}
            gradient="from-amber-600 to-orange-500"
            chipClass="bg-amber-50 text-amber-800 border-amber-100"
            loading={loading}
            suffix={summary?.habitsRate !== null ? "%" : ""}
          />

          <Card
            title="Calories"
            subtitle={unitLabel()}
            value={summary?.caloriesAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-rose-600 to-red-500"
            chipClass="bg-rose-50 text-rose-700 border-rose-100"
            loading={loading}
            suffix={summary?.caloriesAvg !== null ? " kcal" : ""}
          />

          <Card
            title="Protein"
            subtitle={unitLabel()}
            value={summary?.proteinAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-indigo-600 to-sky-500"
            chipClass="bg-indigo-50 text-indigo-700 border-indigo-100"
            loading={loading}
            suffix={summary?.proteinAvg !== null ? " g" : ""}
          />

          <Card
            title="Carbs"
            subtitle={unitLabel()}
            value={summary?.carbsAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-emerald-600 to-lime-500"
            chipClass="bg-emerald-50 text-emerald-700 border-emerald-100"
            loading={loading}
            suffix={summary?.carbsAvg !== null ? " g" : ""}
          />

          <Card
            title="Fat"
            subtitle={unitLabel()}
            value={summary?.fatAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-fuchsia-600 to-pink-500"
            chipClass="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100"
            loading={loading}
            suffix={summary?.fatAvg !== null ? " g" : ""}
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  value,
  icon,
  gradient,
  chipClass,
  loading,
  suffix = "",
}: {
  title: string;
  subtitle?: string;
  value: any;
  icon?: React.ReactNode;
  gradient: string;
  chipClass: string;
  loading: boolean;
  suffix?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="flex items-start justify-between gap-3">
        <div
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} text-white shadow-sm`}
        >
          {icon}
        </div>

        {subtitle ? (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClass}`}>
            {subtitle}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium text-slate-500">{title}</div>

        <div className="mt-1 flex items-baseline gap-1">
          {loading ? (
            <div className="h-8 w-28 animate-pulse rounded bg-slate-100" />
          ) : (
            <>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {value}
              </div>
              {suffix ? <div className="text-sm font-semibold text-slate-500">{suffix}</div> : null}
            </>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-100 opacity-60 blur-2xl transition group-hover:opacity-80" />
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