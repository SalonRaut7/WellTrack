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

  useEffect(() => { load(); }, []);

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
          <div key={it.id} className="bg-white p-3 rounded shadow">
            {editingId === it.id ? (
              <div className="space-y-2">
                <label>Steps count
                  <input type="number" value={editCount} onChange={(e) => setEditCount(Number(e.target.value))} className="w-full p-2 border rounded mt-1" />
                </label>
                <label>Activity
                  <select value={editActivity} onChange={(e) => setEditActivity(e.target.value)} className="w-full p-2 border rounded mt-1">
                    <option value="walking">Walking</option>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="hiking">Hiking</option>
                  </select>
                </label>

                <div className="flex gap-2">
                  <button onClick={() => saveEdit(it.id)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{it.stepsCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
                  <div className="text-sm">{it.activityType}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => startEdit(it)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                  <button onClick={() => remove(it.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
