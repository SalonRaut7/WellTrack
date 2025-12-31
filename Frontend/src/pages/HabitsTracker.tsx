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
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.14),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Habits</h2>
              <p className="mt-1 text-sm text-slate-300">Track your habits and mark them as completed.</p>
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
                <span className="text-xs font-medium text-slate-300">Habit name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={InputBase + " mt-1"}
                  placeholder="e.g. Read 20 minutes"
                />
              </label>
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
              <span className="relative">Add Habit</span>
            </button>
          </div>

          <div className="mt-4">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">Completed</div>
                <div className="text-xs text-slate-300">Mark this habit as done for the selected entry.</div>
              </div>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="h-5 w-5 accent-indigo-500"
              />
            </label>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Entries</div>
              <div className="text-xs text-slate-300">{items.length} total</div>
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
                <div
                  className={[
                    "absolute inset-x-0 top-0 h-1.5",
                    it.completed
                      ? "bg-gradient-to-r from-emerald-500 to-lime-500"
                      : "bg-gradient-to-r from-white/15 to-white/5",
                  ].join(" ")}
                />

                <div
                  className={[
                    "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl",
                    it.completed ? "bg-emerald-500/12" : "bg-white/8",
                    "opacity-60 transition-opacity duration-300 group-hover:opacity-90",
                  ].join(" ")}
                />

                <div className="relative p-4 sm:p-5">
                  {editingId === it.id ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">Edit habit</div>
                          <div className="text-xs text-slate-300">Update the name or completion state.</div>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
                          Editing
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-300">Habit name</span>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} className={InputBase + " mt-1"} />
                          </label>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div>
                              <div className="text-sm font-semibold text-white">Completed</div>
                              <div className="text-xs text-slate-300">Toggle to mark as done.</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={editCompleted}
                              onChange={(e) => setEditCompleted(e.target.checked)}
                              className="h-5 w-5 accent-indigo-500"
                            />
                          </label>
                        </div>
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
                          <div className="text-base font-semibold text-white">{it.name}</div>

                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              it.completed
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                                : "border-white/10 bg-white/10 text-slate-100",
                            ].join(" ")}
                          >
                            {it.completed ? "Done" : "Pending"}
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
                <div className="text-sm font-semibold text-white">No habits yet</div>
                <div className="mt-1 text-xs text-slate-300">Add your first habit above to get started.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}