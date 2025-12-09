import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Habits() {
  const [name, setName] = useState("");
  const [completed, setCompleted] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const resp = await api.get("/api/habit");
    setItems(resp.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/habit", { name, completed });
    setName("");
    setCompleted(false);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Habits</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <label>Habit name
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
          Completed
        </label>
        <button className="py-2 px-4 bg-blue-600 text-white rounded">Add Habit</button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map(it => (
          <div key={it.id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
            </div>
            <div className={`${it.completed ? "text-green-600" : "text-gray-500"}`}>{it.completed ? "Done" : "Pending"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
