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
    "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm";
  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";

  const statusMeta = {
    loading: {
      label: "Generating",
      chip: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
      bar: "from-blue-600 via-indigo-500 to-sky-500",
    },
    ready: {
      label: "Ready",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      bar: "from-emerald-600 via-lime-500 to-green-500",
    },
    error: {
      label: "Error",
      chip: "border-rose-200 bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
      bar: "from-rose-600 via-red-500 to-amber-500",
    },
    idle: {
      label: "Idle",
      chip: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-400",
      bar: "from-slate-500 via-slate-300 to-slate-200",
    },
  } as const;

  const statusKey = loading
    ? "loading"
    : error
      ? "error"
      : prediction
        ? "ready"
        : "idle";

  const meta = statusMeta[statusKey];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className={`mb-6 ${CardBase}`}>
          <div className="relative p-6 sm:p-8">
            <div
              className={[
                "absolute inset-x-0 top-0 h-24 bg-gradient-to-r opacity-15",
                meta.bar,
              ].join(" ")}
            />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  AI Prediction & Recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  A quick readout of what your recent data suggests, plus next steps.
                </p>
              </div>

              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm",
                  meta.chip,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    meta.dot,
                    loading ? "animate-pulse" : "",
                  ].join(" ")}
                />
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  Something went wrong
                </div>
                <div className="mt-1 text-sm text-rose-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className={`${CardBase} p-5 sm:p-6`}>
              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-9/12 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className={`${CardBase} p-5 sm:p-6`}>
              <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-10/12 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-8/12 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-9/12 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {prediction && !loading && (
          <div className="space-y-6">

            <div className={`${CardBase} group transition hover:shadow-md`}>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Summary
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Generated from your latest logs.
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                    Latest
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-line">
                  {prediction.summary}
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Tip: Pick one action item you can do today.
                </div>
              </div>
            </div>

            <div className={`${CardBase} group transition hover:shadow-md`}>
              <div className="p-5 sm:p-6">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Action Items
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {displayActionItems.length} items
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                    Recommendations
                  </span>
                </div>

                <div className="space-y-3">
                  {displayActionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 opacity-80" />

                      <div className="p-4 sm:p-5">
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 shrink-0">
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-slate-800 leading-relaxed">
                              {item}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                Action
                              </span>
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                AI
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {displayActionItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                      <div className="text-sm font-semibold text-slate-900">
                        No action items yet
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Try adding more logs (mood, sleep, steps, hydration, food) and
                        refresh.
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <div className="text-sm font-semibold text-slate-900">
              No prediction yet
            </div>
            <div className="mt-1 text-xs text-slate-500">
              When your data is available, your summary and action items will show
              up here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}