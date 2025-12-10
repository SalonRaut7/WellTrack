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

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/hydration", {
      waterIntakeLiters: ml / 1000
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
      waterIntakeLiters: editMl / 1000
    });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/hydration/${id}`);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Hydration</h2>

      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <label>
          Water intake (ml)
          <input
            type="number"
            value={ml}
            onChange={(e) => setMl(Number(e.target.value))}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <button className="py-2 px-4 bg-blue-600 text-white rounded">
          Log Hydration
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map((it) => (
          <div key={it.id} className="bg-white p-3 rounded shadow">
            {editingId === it.id ? (
             
              <div className="space-y-2">
                <input
                  type="number"
                  value={editMl}
                  onChange={(e) => setEditMl(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(it.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
             
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {(it.waterIntakeLiters || 0).toFixed(2)} L
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(it.date).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(it)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => remove(it.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
