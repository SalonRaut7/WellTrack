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
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 opacity-15" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Hydration</h2>
              <p className="mt-1 text-sm text-slate-500">Log water intake and keep your streak going.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Water intake (ml)</span>
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
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    {preset} ml
                  </button>
                ))}
              </div>
            </div>

            <button className={ButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700"}>
              Log Hydration
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold">Tip:</span> {ml} ml ={" "}
            <span className="font-semibold">{(ml / 1000).toFixed(2)} L</span>
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
            {items.map((it) => (
              <div
                key={it.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-600 to-cyan-500" />

                <div className="p-4 sm:p-5">
                  {editingId === it.id ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Edit hydration entry</div>
                          <div className="text-xs text-slate-500">Update the amount in ml.</div>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                          Editing
                        </span>
                      </div>

                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">Water intake (ml)</span>
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
                          <div className="text-base font-semibold text-slate-900">
                            {(it.waterIntakeLiters || 0).toFixed(2)} L
                          </div>
                          <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {Math.round((it.waterIntakeLiters || 0) * 1000)} ml
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
            ))}

            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <div className="text-sm font-semibold text-slate-900">No hydration logs yet</div>
                <div className="mt-1 text-xs text-slate-500">Log your first entry above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
