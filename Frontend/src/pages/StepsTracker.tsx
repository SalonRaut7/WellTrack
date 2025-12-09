import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Steps() {
  const [count, setCount] = useState(1000);
  const [activity, setActivity] = useState("walking");
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const resp = await api.get("/api/steps");
    setItems(resp.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/steps", { stepsCount: count, activityType: activity });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Steps</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <label>Steps count
          <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full p-2 border rounded mt-1" />
        </label>
        <label>Activity
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option value="walking">Walking</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="hiking">Hiking</option>
          </select>
        </label>
        <button className="py-2 px-4 bg-blue-600 text-white rounded">Add Steps</button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map(it => (
          <div key={it.id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{it.stepsCount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
            </div>
            <div className="text-sm">{it.activityType}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
