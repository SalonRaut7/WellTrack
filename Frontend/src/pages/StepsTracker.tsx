import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Steps() {
  const [count, setCount] = useState(1000);
  const [activity, setActivity] = useState("walking");
  const [items, setItems] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCount, setEditCount] = useState<number>(0);
  const [editActivity, setEditActivity] = useState<string>("walking");

  const load = async () => {
    const resp = await api.get("/api/steps");
    setItems(resp.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/steps", { stepsCount: count, activityType: activity });
    setCount(1000);
    setActivity("walking");
    load();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditCount(item.stepsCount);
    setEditActivity(item.activityType || "walking");
  };

  const saveEdit = async (id: number) => {
    await api.put(`/api/steps/${id}`, { stepsCount: editCount, activityType: editActivity });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/steps/${id}`);
    load();
  };

  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const activityMeta: Record<string, { label: string; chip: string; bar: string; glow: string }> = {
    walking: {
      label: "Walking",
      chip: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
      bar: "from-emerald-500 to-lime-500",
      glow: "bg-emerald-500/12",
    },
    running: {
      label: "Running",
      chip: "border-rose-400/20 bg-rose-500/10 text-rose-100",
      bar: "from-rose-500 to-red-500",
      glow: "bg-rose-500/12",
    },
    cycling: {
      label: "Cycling",
      chip: "border-sky-400/20 bg-sky-500/10 text-sky-100",
      bar: "from-sky-500 to-cyan-500",
      glow: "bg-sky-500/12",
    },
    hiking: {
      label: "Hiking",
      chip: "border-amber-400/20 bg-amber-500/10 text-amber-100",
      bar: "from-amber-500 to-orange-500",
      glow: "bg-amber-500/12",
    },
  };

  const activityKeys = ["walking", "running", "cycling", "hiking"] as const;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(16,185,129,0.16),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.12),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Steps</h2>
              <p className="mt-1 text-sm text-slate-300">Log your steps and activity type.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Steps count</span>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Activity</span>
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className={InputBase + " mt-1"}>
                <option value="walking">Walking</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="hiking">Hiking</option>
              </select>

              <div className="mt-3 flex flex-wrap gap-2">
                {activityKeys.map((k) => {
                  const active = activity === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActivity(k)}
                      className={[
                        "group relative overflow-hidden rounded-full border px-3 py-1.5 text-xs font-semibold",
                        "transition-all duration-300 hover:-translate-y-[1px]",
                        "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                        active
                          ? "border-white/15 bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                          "bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.16),transparent_40%)]",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      <span className="relative">{activityMeta[k].label}</span>
                    </button>
                  );
                })}
              </div>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100">
              <span className="font-semibold text-white">Preview:</span> {count.toLocaleString()} steps ·{" "}
              <span className="font-semibold text-white">{activityMeta[activity]?.label ?? activity}</span>
            </div>

            <button
              className={[
                ButtonBase,
                "relative overflow-hidden text-white",
                "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500",
                "shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)]",
                "hover:-translate-y-[1px]",
              ].join(" ")}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100 bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]"
                aria-hidden="true"
              />
              <span className="relative">Add Steps</span>
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-white">History</div>
              <div className="text-xs text-slate-300">{items.length} entries</div>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((it) => {
              const meta = activityMeta[(it.activityType || "").toLowerCase()] || activityMeta.walking;

              return (
                <div
                  key={it.id}
                  className={[
                    "group relative overflow-hidden rounded-3xl",
                    "border border-white/10 bg-white/[0.06] backdrop-blur-xl",
                    "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)]",
                    "transition-all duration-300",
                    "hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
                  ].join(" ")}
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${meta.bar}`} />

                  <div
                    className={[
                      "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl",
                      meta.glow,
                      "opacity-60 transition-opacity duration-300 group-hover:opacity-90",
                    ].join(" ")}
                  />

                  <div className="relative p-4 sm:p-5">
                    {editingId === it.id ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">Edit steps entry</div>
                            <div className="text-xs text-slate-300">Update count and activity type.</div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                            Editing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-300">Steps count</span>
                            <input
                              type="number"
                              value={editCount}
                              onChange={(e) => setEditCount(Number(e.target.value))}
                              className={InputBase + " mt-1"}
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-medium text-slate-300">Activity</span>
                            <select
                              value={editActivity}
                              onChange={(e) => setEditActivity(e.target.value)}
                              className={InputBase + " mt-1"}
                            >
                              <option value="walking">Walking</option>
                              <option value="running">Running</option>
                              <option value="cycling">Cycling</option>
                              <option value="hiking">Hiking</option>
                            </select>
                          </label>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() => saveEdit(it.id)}
                            className={[
                              SmallButtonBase,
                              "text-white",
                              "bg-gradient-to-r from-emerald-600 to-lime-500",
                              "shadow-[0_16px_45px_-30px_rgba(16,185,129,0.6)]",
                              "hover:-translate-y-[1px]",
                            ].join(" ")}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className={[
                              SmallButtonBase,
                              "border border-white/10 bg-white/10 text-slate-100 hover:bg-white/15",
                              "hover:-translate-y-[1px]",
                            ].join(" ")}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base font-semibold text-white tabular-nums">
                              {Number(it.stepsCount || 0).toLocaleString()}
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}
                            >
                              {meta.label}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-slate-300">{new Date(it.date).toLocaleString()}</div>
                        </div>

                        <div className="flex gap-2 sm:items-center">
                          <button
                            type="button"
                            onClick={() => startEdit(it)}
                            className={[
                              SmallButtonBase,
                              "border border-amber-400/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15",
                              "hover:-translate-y-[1px]",
                            ].join(" ")}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(it.id)}
                            className={[
                              SmallButtonBase,
                              "border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15",
                              "hover:-translate-y-[1px]",
                            ].join(" ")}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.06] p-6 text-center backdrop-blur-xl">
                <div className="text-sm font-semibold text-white">No step logs yet</div>
                <div className="mt-1 text-xs text-slate-300">Add your first entry above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}