import React, { useEffect, useState } from "react";
import api from "../api/axios";
import dayjs from "dayjs";

export default function Sleep() {
  const [bed, setBed] = useState<string>(dayjs().subtract(8, "hour").format("YYYY-MM-DDTHH:mm"));
  const [wake, setWake] = useState<string>(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [quality, setQuality] = useState("Good");
  const [items, setItems] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBed, setEditBed] = useState<string>("");
  const [editWake, setEditWake] = useState<string>("");
  const [editQuality, setEditQuality] = useState<string>("Good");

  const load = async () => {
    const resp = await api.get("/api/sleep");
    setItems(resp.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/sleep", {
      bedTime: new Date(bed).toISOString(),
      wakeUpTime: new Date(wake).toISOString(),
      quality,
    });
    setBed(dayjs().subtract(8, "hour").format("YYYY-MM-DDTHH:mm"));
    setWake(dayjs().format("YYYY-MM-DDTHH:mm"));
    setQuality("Good");
    load();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditBed(dayjs(item.bedTime).format("YYYY-MM-DDTHH:mm"));
    setEditWake(dayjs(item.wakeUpTime).format("YYYY-MM-DDTHH:mm"));
    setEditQuality(item.quality);
  };

  const saveEdit = async (id: number) => {
    await api.put(`/api/sleep/${id}`, {
      bedTime: new Date(editBed).toISOString(),
      wakeUpTime: new Date(editWake).toISOString(),
      quality: editQuality,
    });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/sleep/${id}`);
    load();
  };

  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const qualityMeta: Record<string, { chip: string; bar: string; glow: string }> = {
    Good: {
      chip: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
      bar: "from-emerald-500 to-lime-500",
      glow: "bg-emerald-500/12",
    },
    Average: {
      chip: "border-amber-400/20 bg-amber-500/10 text-amber-100",
      bar: "from-amber-500 to-orange-500",
      glow: "bg-amber-500/12",
    },
    Poor: {
      chip: "border-rose-400/20 bg-rose-500/10 text-rose-100",
      bar: "from-rose-500 to-red-500",
      glow: "bg-rose-500/12",
    },
  };

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
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.14),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Sleep</h2>
              <p className="mt-1 text-sm text-slate-300">Log your bedtime, wake time, and sleep quality.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Bed time</span>
              <input
                type="datetime-local"
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Wake time</span>
              <input
                type="datetime-local"
                value={wake}
                onChange={(e) => setWake(e.target.value)}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-300">Quality</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className={InputBase + " mt-1"}
              >
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-300">Tip: You can adjust times to match your actual sleep window.</div>

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
              <span className="relative">Log Sleep</span>
            </button>
          </div>
        </form>

        {/* History */}
        <div className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-white">History</div>
              <div className="text-xs text-slate-300">{items.length} entries</div>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((it) => {
              const qm = qualityMeta[it.quality] || qualityMeta.Good;

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
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${qm.bar}`} />

                  <div
                    className={[
                      "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl",
                      qm.glow,
                      "opacity-60 transition-opacity duration-300 group-hover:opacity-90",
                    ].join(" ")}
                  />

                  <div className="relative p-4 sm:p-5">
                    {editingId === it.id ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">Edit sleep entry</div>
                            <div className="text-xs text-slate-300">Update the times and quality.</div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                            Editing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-300">Bed time</span>
                            <input
                              type="datetime-local"
                              value={editBed}
                              onChange={(e) => setEditBed(e.target.value)}
                              className={InputBase + " mt-1"}
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-medium text-slate-300">Wake time</span>
                            <input
                              type="datetime-local"
                              value={editWake}
                              onChange={(e) => setEditWake(e.target.value)}
                              className={InputBase + " mt-1"}
                            />
                          </label>

                          <label className="block sm:col-span-2">
                            <span className="text-xs font-medium text-slate-300">Quality</span>
                            <select
                              value={editQuality}
                              onChange={(e) => setEditQuality(e.target.value)}
                              className={InputBase + " mt-1"}
                            >
                              <option>Good</option>
                              <option>Average</option>
                              <option>Poor</option>
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
                            <div className="text-base font-semibold text-white tabular-nums">{it.hours} hrs</div>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${qm.chip}`}>
                              {it.quality}
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
                <div className="text-sm font-semibold text-white">No sleep logs yet</div>
                <div className="mt-1 text-xs text-slate-300">Log your first entry above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}