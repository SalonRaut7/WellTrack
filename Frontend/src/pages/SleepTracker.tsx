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
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";

  const qualityMeta: Record<string, { chip: string; bar: string }> = {
    Good: {
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "from-emerald-500 to-lime-500",
    },
    Average: {
      chip: "border-amber-200 bg-amber-50 text-amber-800",
      bar: "from-amber-500 to-orange-500",
    },
    Poor: {
      chip: "border-rose-200 bg-rose-50 text-rose-700",
      bar: "from-rose-500 to-red-500",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-slate-900 via-indigo-700 to-sky-500 opacity-15" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Sleep</h2>
              <p className="mt-1 text-sm text-slate-500">Log your bedtime, wake time, and sleep quality.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Bed time</span>
              <input
                type="datetime-local"
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">Wake time</span>
              <input
                type="datetime-local"
                value={wake}
                onChange={(e) => setWake(e.target.value)}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Quality</span>
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
            <div className="text-xs text-slate-500">
              Tip: You can adjust times to match your actual sleep window.
            </div>
            <button className={ButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700"}>Log Sleep</button>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">History</div>
              <div className="text-xs text-slate-500">{items.length} entries</div>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((it) => {
              const qm = qualityMeta[it.quality] || qualityMeta.Good;

              return (
                <div
                  key={it.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${qm.bar}`} />

                  <div className="p-4 sm:p-5">
                    {editingId === it.id ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">Edit sleep entry</div>
                            <div className="text-xs text-slate-500">Update the times and quality.</div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            Editing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Bed time</span>
                            <input
                              type="datetime-local"
                              value={editBed}
                              onChange={(e) => setEditBed(e.target.value)}
                              className={InputBase + " mt-1"}
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Wake time</span>
                            <input
                              type="datetime-local"
                              value={editWake}
                              onChange={(e) => setEditWake(e.target.value)}
                              className={InputBase + " mt-1"}
                            />
                          </label>

                          <label className="block sm:col-span-2">
                            <span className="text-xs font-medium text-slate-600">Quality</span>
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
                            className={SmallButtonBase + " bg-emerald-600 text-white hover:bg-emerald-700"}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className={SmallButtonBase + " bg-slate-100 text-slate-800 hover:bg-slate-200"}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base font-semibold text-slate-900 tabular-nums">{it.hours} hrs</div>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${qm.chip}`}>
                              {it.quality}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-slate-500">{new Date(it.date).toLocaleString()}</div>
                        </div>

                        <div className="flex gap-2 sm:items-center">
                          <button
                            type="button"
                            onClick={() => startEdit(it)}
                            className={SmallButtonBase + " border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(it.id)}
                            className={SmallButtonBase + " border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"}
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
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <div className="text-sm font-semibold text-slate-900">No sleep logs yet</div>
                <div className="mt-1 text-xs text-slate-500">Log your first entry above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}