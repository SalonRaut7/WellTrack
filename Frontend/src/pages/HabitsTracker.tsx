import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Habits() {
  const [name, setName] = useState("");
  const [completed, setCompleted] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCompleted, setEditCompleted] = useState(false);

  const load = async () => {
    const resp = await api.get("/api/habit");
    setItems(resp.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Habit name is required");
      return;
    }
    await api.post("/api/habit", { name, completed });
    setName("");
    setCompleted(false);
    load();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCompleted(item.completed);
  };

  const saveEdit = async (id: number) => {
    await api.put(`/api/habit/${id}`, {
      name: editName,
      completed: editCompleted,
    });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/habit/${id}`);
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
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 opacity-15" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Habits</h2>
              <p className="mt-1 text-sm text-slate-500">Track your habits and mark them as completed.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Habit name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={InputBase + " mt-1"}
                  placeholder="e.g. Read 20 minutes"
                />
              </label>
            </div>

            <button className={ButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700"}>
              Add Habit
            </button>
          </div>

          <div className="mt-4">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <div className="text-sm font-semibold text-slate-900">Completed</div>
                <div className="text-xs text-slate-500">Mark this habit as done for the selected entry.</div>
              </div>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="h-5 w-5 accent-indigo-600"
              />
            </label>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Entries</div>
              <div className="text-xs text-slate-500">{items.length} total</div>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div
                  className={[
                    "absolute inset-x-0 top-0 h-1.5",
                    it.completed
                      ? "bg-gradient-to-r from-emerald-500 to-lime-500"
                      : "bg-gradient-to-r from-slate-400 to-slate-200",
                  ].join(" ")}
                />

                <div className="p-4 sm:p-5">
                  {editingId === it.id ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Edit habit</div>
                          <div className="text-xs text-slate-500">Update the name or completion state.</div>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                          Editing
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Habit name</span>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={InputBase + " mt-1"}
                            />
                          </label>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">Completed</div>
                              <div className="text-xs text-slate-500">Toggle to mark as done.</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={editCompleted}
                              onChange={(e) => setEditCompleted(e.target.checked)}
                              className="h-5 w-5 accent-indigo-600"
                            />
                          </label>
                        </div>
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
                          <div className="text-base font-semibold text-slate-900">{it.name}</div>
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              it.completed
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-600",
                            ].join(" ")}
                          >
                            {it.completed ? "Done" : "Pending"}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(it.date).toLocaleString()}
                        </div>
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
                <div className="text-sm font-semibold text-slate-900">No habits yet</div>
                <div className="mt-1 text-xs text-slate-500">Add your first habit above to get started.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}