import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Hydration() {
  const [ml, setMl] = useState(500);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const resp = await api.get("/api/hydration");
    setItems(resp.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/hydration", { waterIntakeLiters: ml / 1000 });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Hydration</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <label>Water intake (ml)
          <input type="number" value={ml} onChange={(e) => setMl(Number(e.target.value))} className="w-full p-2 border rounded mt-1" />
        </label>
        <button className="py-2 px-4 bg-blue-600 text-white rounded">Log Hydration</button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map(it => (
          <div key={it.id} className="bg-white p-3 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{(it.waterIntakeLiters || 0).toFixed(2)} L</div>
              <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
