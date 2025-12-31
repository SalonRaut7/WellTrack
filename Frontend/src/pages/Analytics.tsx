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
        const [habitResp, moodResp, sleepResp, stepsResp, hydrationResp, foodResp] = await Promise.all([
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

      <div className="relative mx-auto max-w-3xl p-6">
        <div className={`mb-6 ${CardBase}`}>
          <div className="relative p-6 sm:p-8">
            <div className={["absolute inset-x-0 top-0 h-24 bg-gradient-to-r opacity-20", meta.bar].join(" ")} />
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.14),transparent_50%)]" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  AI Prediction & Recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  A quick readout of what your recent data suggests, plus next steps.
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
                    <div className="text-sm font-semibold text-white">Summary</div>
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