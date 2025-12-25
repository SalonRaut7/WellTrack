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
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";

  const activityMeta: Record<string, { label: string; chip: string; bar: string }> = {
    walking: {
      label: "Walking",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "from-emerald-500 to-lime-500",
    },
    running: {
      label: "Running",
      chip: "border-rose-200 bg-rose-50 text-rose-700",
      bar: "from-rose-500 to-red-500",
    },
    cycling: {
      label: "Cycling",
      chip: "border-sky-200 bg-sky-50 text-sky-700",
      bar: "from-sky-500 to-cyan-500",
    },
    hiking: {
      label: "Hiking",
      chip: "border-amber-200 bg-amber-50 text-amber-800",
      bar: "from-amber-500 to-orange-500",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-600 via-lime-500 to-sky-500 opacity-15" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Steps</h2>
              <p className="mt-1 text-sm text-slate-500">Log your steps and activity type.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Steps count</span>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">Activity</span>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className={InputBase + " mt-1"}
              >
                <option value="walking">Walking</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="hiking">Hiking</option>
              </select>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["walking", "running", "cycling", "hiking"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActivity(k)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition",
                      activity === k
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {activityMeta[k].label}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold">Preview:</span> {count.toLocaleString()} steps ·{" "}
              <span className="font-semibold">{activityMeta[activity]?.label ?? activity}</span>
            </div>

            <button className={ButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700"}>Add Steps</button>
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
              const meta = activityMeta[(it.activityType || "").toLowerCase()] || activityMeta.walking;

              return (
                <div
                  key={it.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${meta.bar}`} />

                  <div className="p-4 sm:p-5">
                    {editingId === it.id ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">Edit steps entry</div>
                            <div className="text-xs text-slate-500">Update count and activity type.</div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            Editing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Steps count</span>
                            <input
                              type="number"
                              value={editCount}
                              onChange={(e) => setEditCount(Number(e.target.value))}
                              className={InputBase + " mt-1"}
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Activity</span>
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
                            <div className="text-base font-semibold text-slate-900 tabular-nums">
                              {Number(it.stepsCount || 0).toLocaleString()}
                            </div>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>
                              {meta.label}
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
                <div className="text-sm font-semibold text-slate-900">No step logs yet</div>
                <div className="mt-1 text-xs text-slate-500">Add your first entry above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
