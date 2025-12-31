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
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mt-0 mb-6 overflow-hidden relative mx-auto max-w-6xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.18),transparent_50%)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-300">Your health summary · {rangeLabel()}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["daily", "weekly", "monthly"] as View[]).map((v) => {
                  const active = view === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={[
                        "relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold",
                        "transition-all duration-300",
                        "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                        active
                          ? "text-white shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)]"
                          : "text-slate-200 hover:text-white",
                        active
                          ? "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500"
                          : "bg-white/10 hover:bg-white/15 border border-white/10",
                        "hover:-translate-y-[1px]",
                      ].join(" ")}
                    >
                      <span className="relative z-10">
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </span>
                      <span
                        className={[
                          "pointer-events-none absolute inset-0 opacity-0",
                          "bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]",
                          "transition-opacity duration-500",
                          "hover:opacity-100",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_0%,rgba(244,63,94,0.14),transparent_55%),radial-gradient(900px_circle_at_90%_120%,rgba(99,102,241,0.14),transparent_55%)]" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Daily motivation</div>
                <div className="mt-1 text-xs text-slate-300">
                  {motivation?.date ? `For ${motivation.date}` : "For today"}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100">
                  {motivationLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-9/12 animate-pulse rounded bg-white/10" />
                    </div>
                  ) : motivationError ? (
                    <div className="text-rose-300">{motivationError}</div>
                  ) : motivation?.message ? (
                    <div className="leading-relaxed text-slate-100">{motivation.message}</div>
                  ) : (
                    <div className="text-slate-300">No motivation available yet.</div>
                  )}
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200">
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
                <div
                  key={i}
                  className={[
                    "rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl",
                    "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/10" />
                    <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
                    <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
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
                  <span className="text-white">{summary.mood.text}</span>
                </span>
              ) : (
                "—"
              )
            }
            icon={<Heart className="h-5 w-5" />}
            gradient="from-fuchsia-500 to-pink-500"
            chipClass="bg-fuchsia-500/10 text-fuchsia-100 border-fuchsia-400/20"
            loading={loading}
          />

          <Card
            title="Sleep"
            subtitle={unitLabel()}
            value={summary?.sleepAvg ?? "—"}
            icon={<Moon className="h-5 w-5" />}
            gradient="from-indigo-500 to-sky-500"
            chipClass="bg-indigo-500/10 text-indigo-100 border-indigo-400/20"
            loading={loading}
            suffix={summary?.sleepAvg !== null ? " hrs" : ""}
          />

          <Card
            title="Steps"
            subtitle={unitLabel()}
            value={summary?.stepsAvg ?? "—"}
            icon={<Footprints className="h-5 w-5" />}
            gradient="from-emerald-500 to-lime-500"
            chipClass="bg-emerald-500/10 text-emerald-100 border-emerald-400/20"
            loading={loading}
          />

          <Card
            title="Hydration"
            subtitle={unitLabel()}
            value={summary?.hydrationAvg ?? "—"}
            icon={<Droplets className="h-5 w-5" />}
            gradient="from-sky-500 to-cyan-500"
            chipClass="bg-sky-500/10 text-sky-100 border-sky-400/20"
            loading={loading}
            suffix={summary?.hydrationAvg !== null ? " L" : ""}
          />

          <Card
            title="Habits Completed"
            subtitle="%"
            value={summary?.habitsRate ?? "—"}
            icon={<CheckCircle2 className="h-5 w-5" />}
            gradient="from-amber-500 to-orange-500"
            chipClass="bg-amber-500/10 text-amber-100 border-amber-400/20"
            loading={loading}
            suffix={summary?.habitsRate !== null ? "%" : ""}
          />

          <Card
            title="Calories"
            subtitle={unitLabel()}
            value={summary?.caloriesAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-rose-500 to-red-500"
            chipClass="bg-rose-500/10 text-rose-100 border-rose-400/20"
            loading={loading}
            suffix={summary?.caloriesAvg !== null ? " kcal" : ""}
          />

          <Card
            title="Protein"
            subtitle={unitLabel()}
            value={summary?.proteinAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-indigo-500 to-sky-500"
            chipClass="bg-indigo-500/10 text-indigo-100 border-indigo-400/20"
            loading={loading}
            suffix={summary?.proteinAvg !== null ? " g" : ""}
          />

          <Card
            title="Carbs"
            subtitle={unitLabel()}
            value={summary?.carbsAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-emerald-500 to-lime-500"
            chipClass="bg-emerald-500/10 text-emerald-100 border-emerald-400/20"
            loading={loading}
            suffix={summary?.carbsAvg !== null ? " g" : ""}
          />

          <Card
            title="Fat"
            subtitle={unitLabel()}
            value={summary?.fatAvg ?? "—"}
            icon={<Utensils className="h-5 w-5" />}
            gradient="from-fuchsia-500 to-pink-500"
            chipClass="bg-fuchsia-500/10 text-fuchsia-100 border-fuchsia-400/20"
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
    <div
      className={[
        "group relative overflow-hidden rounded-3xl",
        "border border-white/10 bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)]",
        "transition-all duration-300",
        "hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
      ].join(" ")}
    >

      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />

      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-[radial-gradient(900px_circle_at_15%_0%,rgba(255,255,255,0.10),transparent_55%)]",
        ].join(" ")}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className={[
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white",
              `bg-gradient-to-r ${gradient}`,
              "shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)]",
              "transition-transform duration-300 group-hover:scale-[1.05]",
            ].join(" ")}
          >
            {icon}
          </div>

          {subtitle ? (
            <span
              className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                chipClass,
              ].join(" ")}
            >
              {subtitle}
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium text-slate-300">{title}</div>

          <div className="mt-1 flex items-baseline gap-1">
            {loading ? (
              <div className="h-8 w-28 animate-pulse rounded bg-white/10" />
            ) : (
              <>
                <div className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  {value}
                </div>
                {suffix ? <div className="text-sm font-semibold text-slate-300">{suffix}</div> : null}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={[
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl",
          "bg-white/10 opacity-60 transition-opacity duration-300 group-hover:opacity-90",
        ].join(" ")}
      />
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