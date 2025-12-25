import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Mood() {
  const [mood, setMood] = useState("happy");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMood, setEditMood] = useState("happy");
  const [editNotes, setEditNotes] = useState("");

  const load = async () => {
    const resp = await api.get("/api/mood");
    setItems(resp.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/mood", { mood, notes });
    setMood("happy");
    setNotes("");
    load();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditMood(item.mood);
    setEditNotes(item.notes || "");
  };

  const saveEdit = async (id: number) => {
    await api.put(`/api/mood/${id}`, { mood: editMood, notes: editNotes });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/mood/${id}`);
    load();
  };

  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";

  const moodMeta: Record<string, { label: string; emoji: string; chip: string; bar: string }> = {
    happy: {
      label: "Happy",
      emoji: "😄",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "from-emerald-500 to-lime-500",
    },
    relaxed: {
      label: "Relaxed",
      emoji: "🙂",
      chip: "border-sky-200 bg-sky-50 text-sky-700",
      bar: "from-sky-500 to-cyan-500",
    },
    neutral: {
      label: "Neutral",
      emoji: "😐",
      chip: "border-slate-200 bg-slate-50 text-slate-700",
      bar: "from-slate-400 to-slate-200",
    },
    sad: {
      label: "Sad",
      emoji: "😢",
      chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
      bar: "from-indigo-500 to-sky-500",
    },
    angry: {
      label: "Angry",
      emoji: "😡",
      chip: "border-rose-200 bg-rose-50 text-rose-700",
      bar: "from-rose-500 to-red-500",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-500 opacity-15" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Mood</h2>
              <p className="mt-1 text-sm text-slate-500">Log how you feel and add a note if you want.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Mood</span>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className={InputBase + " mt-1"}
                >
                  <option value="happy">Happy</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="neutral">Neutral</option>
                  <option value="sad">Sad</option>
                  <option value="angry">Angry</option>
                </select>
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["happy", "relaxed", "neutral", "sad", "angry"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMood(k)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition",
                      mood === k ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                    title={moodMeta[k].label}
                  >
                    {moodMeta[k].emoji} {moodMeta[k].label}
                  </button>
                ))}
              </div>
            </div>

            <button className={ButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700"}>Add Mood</button>
          </div>

          <div className="mt-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={InputBase + " mt-1 min-h-[96px]"}
                placeholder="Optional: what influenced your mood today?"
              />
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold">Selected:</span>{" "}
            {moodMeta[mood]?.emoji} {moodMeta[mood]?.label}
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
              const meta = moodMeta[(it.mood || "").toLowerCase()] || moodMeta.neutral;
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
                            <div className="text-sm font-semibold text-slate-900">Edit mood entry</div>
                            <div className="text-xs text-slate-500">Update the mood and notes.</div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                            Editing
                          </span>
                        </div>

                        <label className="block">
                          <span className="text-xs font-medium text-slate-600">Mood</span>
                          <select
                            value={editMood}
                            onChange={(e) => setEditMood(e.target.value)}
                            className={InputBase + " mt-1"}
                          >
                            <option value="happy">Happy</option>
                            <option value="relaxed">Relaxed</option>
                            <option value="neutral">Neutral</option>
                            <option value="sad">Sad</option>
                            <option value="angry">Angry</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="text-xs font-medium text-slate-600">Notes</span>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className={InputBase + " mt-1 min-h-[96px]"}
                            placeholder="Optional notes"
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
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base font-semibold text-slate-900">
                              {meta.emoji} {meta.label}
                            </div>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>
                              Mood
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {new Date(it.date).toLocaleString()}
                          </div>

                          {it.notes ? (
                            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              {it.notes}
                            </div>
                          ) : (
                            <div className="mt-3 text-xs text-slate-400">No notes</div>
                          )}
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
                <div className="text-sm font-semibold text-slate-900">No mood entries yet</div>
                <div className="mt-1 text-xs text-slate-500">Add your first mood above.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}