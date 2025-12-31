import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Hydration() {
  const [ml, setMl] = useState(500);
  const [items, setItems] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMl, setEditMl] = useState<number>(0);

  const load = async () => {
    const resp = await api.get("/api/hydration");
    setItems(resp.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/hydration", {
      waterIntakeLiters: ml / 1000,
    });
    setMl(500);
    load();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditMl(item.waterIntakeLiters * 1000); // convert back to ml for editing
  };

  const saveEdit = async (id: number) => {
    await api.put(`/api/hydration/${id}`, {
      waterIntakeLiters: editMl / 1000,
    });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/hydration/${id}`);
    load();
  };

  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

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
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(99,102,241,0.16),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Hydration</h2>
              <p className="mt-1 text-sm text-slate-300">Log water intake and keep your streak going.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Water intake (ml)</span>
                <input
                  type="number"
                  value={ml}
                  onChange={(e) => setMl(Number(e.target.value))}
                  className={InputBase + " mt-1"}
                  placeholder="e.g. 500"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                {[250, 500, 750, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMl(preset)}
                    className={[
                      "group relative overflow-hidden rounded-full border px-3 py-1.5 text-xs font-semibold",
                      "border-white/10 bg-white/5 text-slate-200",
                      "transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/10 hover:text-white",
                      "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                        "bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.16),transparent_40%)]",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                    <span className="relative">{preset} ml</span>
                  </button>
                ))}
              </div>
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
              <span className="relative">Log Hydration</span>
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100">
            <span className="font-semibold text-white">Tip:</span> {ml} ml ={" "}
            <span className="font-semibold text-white">{(ml / 1000).toFixed(2)} L</span>
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
            {items.map((it) => (
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
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-500 to-cyan-500" />

                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-500/12 blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                <div className="relative p-4 sm:p-5">
                  {editingId === it.id ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">Edit hydration entry</div>
                          <div className="text-xs text-slate-300">Update the amount in ml.</div>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                          Editing
                        </span>
                      </div>

                      <label className="block">
                        <span className="text-xs font-medium text-slate-300">Water intake (ml)</span>
                        <input
                          type="number"
                          value={editMl}
                          onChange={(e) => setEditMl(Number(e.target.value))}
                          className={InputBase + " mt-1"}
                        />
                      </label>

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
                            {(it.waterIntakeLiters || 0).toFixed(2)} L
                          </div>
                          <span className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-100">
                            {Math.round((it.waterIntakeLiters || 0) * 1000)} ml
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
            ))}

            {items.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.06] p-6 text-center backdrop-blur-xl">
                <div className="text-sm font-semibold text-white">No hydration logs yet</div>
                <div className="mt-1 text-xs text-slate-300">Log your first entry above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}