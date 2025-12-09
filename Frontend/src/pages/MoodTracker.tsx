import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Mood() {
  const [mood, setMood] = useState("happy");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const resp = await api.get("/api/mood");
    setItems(resp.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/mood", { mood, notes });
    setNotes("");
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Mood</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <label className="block">
          Mood
          <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option value="happy">Happy</option>
            <option value="relaxed">Relaxed</option>
            <option value="neutral">Neutral</option>
            <option value="sad">Sad</option>
            <option value="angry">Angry</option>
          </select>
        </label>
        <label className="block">
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </label>
        <button className="py-2 px-4 bg-blue-600 text-white rounded">Add Mood</button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map((it) => (
          <div key={it.id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{it.mood}</div>
              <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
            </div>
            <div className="text-sm">{it.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
