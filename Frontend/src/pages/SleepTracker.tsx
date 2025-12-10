import React, { useEffect, useState } from "react";
import api from "../api/axios";
import dayjs from "dayjs";

export default function Sleep() {
  const [bed, setBed] = useState<string>(dayjs().subtract(8, "hour").format("YYYY-MM-DDTHH:mm"));
  const [wake, setWake] = useState<string>(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [quality, setQuality] = useState("Good");
  const [items, setItems] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBed, setEditBed] = useState<string>("");
  const [editWake, setEditWake] = useState<string>("");
  const [editQuality, setEditQuality] = useState<string>("Good");

  const load = async () => {
    const resp = await api.get("/api/sleep");
    setItems(resp.data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/sleep", {
      bedTime: new Date(bed).toISOString(),
      wakeUpTime: new Date(wake).toISOString(),
      quality
    });
    setBed(dayjs().subtract(8, "hour").format("YYYY-MM-DDTHH:mm"));
    setWake(dayjs().format("YYYY-MM-DDTHH:mm"));
    setQuality("Good");
    load();
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditBed(dayjs(item.bedTime).format("YYYY-MM-DDTHH:mm"));
    setEditWake(dayjs(item.wakeUpTime).format("YYYY-MM-DDTHH:mm"));
    setEditQuality(item.quality);
  };

  const saveEdit = async (id: number) => {
    await api.put(`/api/sleep/${id}`, {
      bedTime: new Date(editBed).toISOString(),
      wakeUpTime: new Date(editWake).toISOString(),
      quality: editQuality
    });
    setEditingId(null);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/sleep/${id}`);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Sleep</h2>

      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <label>Bed time
          <input type="datetime-local" value={bed} onChange={(e) => setBed(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </label>
        <label>Wake time
          <input type="datetime-local" value={wake} onChange={(e) => setWake(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </label>
        <label>Quality
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option>Good</option>
            <option>Average</option>
            <option>Poor</option>
          </select>
        </label>
        <button className="py-2 px-4 bg-blue-600 text-white rounded">Log Sleep</button>
      </form>

      <div className="mt-6 space-y-2">
        {items.map(it => (
          <div key={it.id} className="bg-white p-3 rounded shadow">
            {editingId === it.id ? (
              <div className="space-y-2">
                <label>Bed time
                  <input type="datetime-local" value={editBed} onChange={(e) => setEditBed(e.target.value)} className="w-full p-2 border rounded mt-1" />
                </label>
                <label>Wake time
                  <input type="datetime-local" value={editWake} onChange={(e) => setEditWake(e.target.value)} className="w-full p-2 border rounded mt-1" />
                </label>
                <label>Quality
                  <select value={editQuality} onChange={(e) => setEditQuality(e.target.value)} className="w-full p-2 border rounded mt-1">
                    <option>Good</option>
                    <option>Average</option>
                    <option>Poor</option>
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
                  <div className="font-semibold">{it.hours} hrs</div>
                  <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
                  <div className="text-sm">{it.quality}</div>
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
