import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import aiApi from "../api/aiApi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { useHydrationChart } from "../hooks/useHydrationChart";
import { useSleepChart } from "../hooks/useSleepChart";
import { useStepsChart } from "../hooks/useStepsChart";

type PredictResult = {
  summary: string;
  action_items: string[];
};

type ChartPoint = Record<string, any>;

function formatDateLabel(value: any) {
  if (!value) return "";
  const s = String(value);
  // If it's ISO-ish, show MM/DD, otherwise return as is.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return s;
}

function clampNumber(n: any) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function getNumericKeyFromRow(row: ChartPoint): string | null {
  // Prefer common names
  const preferred = ["value", "steps", "stepsCount", "hours", "liters", "water", "waterIntakeLiters"];
  for (const k of preferred) {
    if (k in row && Number.isFinite(Number(row[k]))) return k;
  }
  // Otherwise first numeric key
  for (const k of Object.keys(row)) {
    if (Number.isFinite(Number(row[k]))) return k;
  }
  return null;
}

function getXAxisKeyFromRow(row: ChartPoint): string | null {
  const preferred = ["date", "day", "label", "name", "x"];
  for (const k of preferred) {
    if (k in row) return k;
  }
  // Otherwise first string-ish key
  for (const k of Object.keys(row)) {
    const v = row[k];
    if (typeof v === "string") return k;
  }
  return null;
}

function GradientLineChartCard({
  title,
  subtitle,
  data,
  color,
  gradient,
  unitSuffix = "",
}: {
  title: string;
  subtitle: string;
  data: any[];
  color: string;
  gradient: string;
  unitSuffix?: string;
}) {
  const safeData: ChartPoint[] = Array.isArray(data) ? data : [];

  const { xKey, yKey } = useMemo(() => {
    const first = safeData[0];
    if (!first) return { xKey: "date", yKey: "value" };
    return {
      xKey: getXAxisKeyFromRow(first) || "date",
      yKey: getNumericKeyFromRow(first) || "value",
    };
  }, [safeData]);

  // Normalize into a predictable shape so charts look consistent
  const normalized = useMemo(() => {
    return safeData.map((row) => {
      const x = row?.[xKey];
      const y = row?.[yKey];
      return {
        x: x ?? "",
        y: clampNumber(y),
        _raw: row,
      };
    });
  }, [safeData, xKey, yKey]);

  const empty = normalized.length === 0;

  const cardBase =
    "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";

  return (
    <div
      className={[
        cardBase,
        "relative transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
      ].join(" ")}
    >
      <div className={["absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r opacity-80", gradient].join(" ")} />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_0%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(800px_circle_at_95%_120%,rgba(56,189,248,0.10),transparent_55%)]" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-xs text-slate-300">{subtitle}</div>
          </div>

          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100">
            {empty ? "No data" : `${normalized.length} pts`}
          </span>
        </div>

        <div className="mt-4 h-56 w-full">
          {empty ? (
            <div className="h-full w-full rounded-2xl border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-xs text-slate-300">
              No chart data available for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normalized} margin={{ top: 10, right: 18, left: -6, bottom: 0 }}>
                <defs>
                  <linearGradient id={`${title}-area`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="70%" stopColor={color} stopOpacity={0.06} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="x"
                  tickFormatter={formatDateLabel}
                  tick={{ fill: "rgba(226,232,240,0.75)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  minTickGap={18}
                />
                <YAxis
                  tick={{ fill: "rgba(226,232,240,0.75)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  width={34}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2,6,23,0.92)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 14,
                    color: "rgba(248,250,252,0.95)",
                    boxShadow: "0 30px 80px -50px rgba(0,0,0,0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                  labelStyle={{ color: "rgba(226,232,240,0.85)" }}
                  formatter={(v: any) => [`${v}${unitSuffix}`, title]}
                  labelFormatter={(l: any) => formatDateLabel(l)}
                />
                <Legend
                  wrapperStyle={{
                    color: "rgba(226,232,240,0.75)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  name={title}
                  stroke={color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [prediction, setPrediction] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [range] = useState<"week" | "month">("week");

  const stepsData = useStepsChart(range);
  const sleepData = useSleepChart(range);
  const hydrationData = useHydrationChart(range);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        const [habitResp, moodResp, sleepResp, stepsResp, hydrationResp, foodResp] =
          await Promise.all([
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

  const displayActionItems =
    prediction?.action_items
      ?.map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean)
      .filter((s) => {
        const normalized = s.toLowerCase().replace(/\s+/g, " ").trim();

        const looksLikePreface =
          normalized.startsWith("here are") ||
          normalized.startsWith("actionable") ||
          normalized.startsWith("recommendations") ||
          normalized === "here are some actionable health recommendations for you:" ||
          normalized === "here are some actionable recommendations for you:";

        const looksLikeHeading = normalized.endsWith(":") && normalized.length <= 80;

        return !(looksLikePreface || looksLikeHeading);
      }) ?? [];

  const CardBase =
    "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";
  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";

  const statusMeta = {
    loading: {
      label: "Generating",
      chip: "border-sky-400/20 bg-sky-500/10 text-sky-100",
      dot: "bg-sky-400",
      bar: "from-sky-500 via-indigo-500 to-cyan-500",
    },
    ready: {
      label: "Ready",
      chip: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
      dot: "bg-emerald-400",
      bar: "from-emerald-500 via-lime-500 to-green-500",
    },
    error: {
      label: "Error",
      chip: "border-rose-400/20 bg-rose-500/10 text-rose-100",
      dot: "bg-rose-400",
      bar: "from-rose-500 via-red-500 to-amber-500",
    },
    idle: {
      label: "Idle",
      chip: "border-white/10 bg-white/10 text-slate-100",
      dot: "bg-slate-300",
      bar: "from-white/20 via-white/10 to-white/5",
    },
  } as const;

  const statusKey = loading ? "loading" : error ? "error" : prediction ? "ready" : "idle";
  const meta = statusMeta[statusKey];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl p-6">
        <div className={`mb-6 ${CardBase}`}>
          <div className="relative p-6 sm:p-8">
            <div className={["absolute inset-x-0 top-0 h-24 bg-gradient-to-r opacity-20", meta.bar].join(" ")} />
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.14),transparent_50%)]" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Analytics
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Charts + AI-generated summary and action items from your latest logs.
                </p>
              </div>

              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                  meta.chip,
                ].join(" ")}
              >
                <span className={["h-2 w-2 rounded-full", meta.dot, loading ? "animate-pulse" : ""].join(" ")} />
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Weekly Health Analytics</div>
              <div className="mt-1 text-xs text-slate-300">
                Visual trends for the selected range.
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100">
              Range: {range}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GradientLineChartCard
              title="Steps"
              subtitle="Daily total"
              data={stepsData}
              color="#34d399"
              gradient="from-emerald-500 via-lime-500 to-green-500"
            />
            <GradientLineChartCard
              title="Sleep"
              subtitle="Hours"
              data={sleepData}
              color="#818cf8" 
              gradient="from-indigo-500 via-sky-500 to-cyan-500"
              unitSuffix="h"
            />
            <GradientLineChartCard
              title="Hydration"
              subtitle="Liters"
              data={hydrationData}
              color="#38bdf8"
              gradient="from-sky-500 via-cyan-500 to-teal-500"
              unitSuffix="L"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-400/20 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Something went wrong</div>
                <div className="mt-1 text-sm text-rose-200">{error}</div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className={`${CardBase} p-5 sm:p-6`}>
              <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-9/12 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
            <div className={`${CardBase} p-5 sm:p-6`}>
              <div className="h-4 w-36 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-10/12 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-8/12 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-9/12 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {prediction && !loading && (
          <div className="space-y-6">
            <div
              className={[
                CardBase,
                "group transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
              ].join(" ")}
            >
              <div className="relative p-5 sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/12 blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">AI Summary</div>
                    <div className="mt-1 text-xs text-slate-300">Generated from your latest logs.</div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                    Latest
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 whitespace-pre-line">
                  {prediction.summary}
                </div>

                <div className="mt-4 text-xs text-slate-300">Tip: Pick one action item you can do today.</div>
              </div>
            </div>

            <div
              className={[
                CardBase,
                "group transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
              ].join(" ")}
            >
              <div className="relative p-5 sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Action Items</div>
                    <div className="mt-1 text-xs text-slate-300">{displayActionItems.length} items</div>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                    Recommendations
                  </span>
                </div>

                <div className="space-y-3">
                  {displayActionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={[
                        "group/item relative overflow-hidden rounded-3xl",
                        "border border-white/10 bg-white/[0.06] backdrop-blur-xl",
                        "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)]",
                        "transition-all duration-300",
                        "hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
                      ].join(" ")}
                    >
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 opacity-80" />

                      <div className="relative p-4 sm:p-5">
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xs font-bold text-slate-100 shrink-0">
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-slate-100 leading-relaxed">{item}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-100">
                                Action
                              </span>
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100">
                                AI
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {displayActionItems.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.06] p-6 text-center backdrop-blur-xl">
                      <div className="text-sm font-semibold text-white">No action items yet</div>
                      <div className="mt-1 text-xs text-slate-300">
                        Try adding more logs (mood, sleep, steps, hydration, food) and refresh.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden">
              <input className={InputBase} />
            </div>
          </div>
        )}

        {!loading && !error && !prediction && (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.06] p-6 text-center backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">No prediction yet</div>
            <div className="mt-1 text-xs text-slate-300">
              When your data is available, your summary and action items will show up here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}