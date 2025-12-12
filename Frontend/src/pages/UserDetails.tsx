import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

type TrackerType = "Mood" | "Sleep" | "Steps" | "Hydration" | "Habits";

export default function UserDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [trackers, setTrackers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<{ type: TrackerType; id: number } | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const token = localStorage.getItem("accessToken");

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/api/Admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get(`/api/Admin/user/${id}/trackers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([userResp, trackersResp]) => {
        setUser(userResp.data);
        setTrackers({
          Mood: trackersResp.data.mood || trackersResp.data.Mood || [],
          Sleep: trackersResp.data.sleep || trackersResp.data.Sleep || [],
          Steps: trackersResp.data.steps || trackersResp.data.Steps || [],
          Hydration: trackersResp.data.hydration || trackersResp.data.Hydration || [],
          Habits: trackersResp.data.habits || trackersResp.data.Habits || [],
        });
      })
      .catch((err) => {
        console.error("User details fetch error:", err);
        setError("Failed to load user details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const startEdit = (type: TrackerType, item: any) => {
    setEditing({ type, id: item.id });

    if (type === "Mood") setEditValues({ mood: item.mood, notes: item.notes, date: item.date });
    else if (type === "Sleep")
      setEditValues({
        BedTime: item.bedTime,
        WakeUpTime: item.wakeUpTime,
        Hours: item.hours,
        Quality: item.quality,
        date: item.date,
      });
    else if (type === "Steps") setEditValues({ StepsCount: item.stepsCount, ActivityType: item.activityType, date: item.date });
    else if (type === "Hydration") setEditValues({ WaterIntakeLiters: item.waterIntakeLiters, date: item.date });
    else if (type === "Habits") setEditValues({ name: item.name, completed: item.completed, date: item.date });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { type, id: trackerId } = editing;

    try {
      let endpoint = "";
      let payload: any = {};

      switch (type) {
        case "Mood":
          endpoint = `/api/Admin/mood/${trackerId}`;
          payload = {
            Mood: editValues.mood,
            Notes: editValues.notes,
            Date: editValues.date ? new Date(editValues.date).toISOString() : null,
          };
          break;

        case "Sleep":
          endpoint = `/api/Admin/sleep/${trackerId}`;
          payload = {
            BedTime: editValues.BedTime ? new Date(editValues.BedTime).toISOString() : null,
            WakeUpTime: editValues.WakeUpTime ? new Date(editValues.WakeUpTime).toISOString() : null,
            Quality: editValues.Quality,
            Date: editValues.date ? new Date(editValues.date).toISOString() : null,
          };
          break;

        case "Steps":
          endpoint = `/api/Admin/steps/${trackerId}`;
          payload = {
            StepsCount: parseInt(editValues.StepsCount),
            ActivityType: editValues.ActivityType,
            Date: editValues.date ? new Date(editValues.date).toISOString() : null,
          };
          break;

        case "Hydration":
          endpoint = `/api/Admin/hydration/${trackerId}`;
          payload = {
            WaterIntakeLiters: parseFloat(editValues.WaterIntakeLiters),
            Date: editValues.date ? new Date(editValues.date).toISOString() : null,
          };
          break;

        case "Habits":
          endpoint = `/api/Admin/habits/${trackerId}`;
          payload = {
            Name: editValues.name,
            Completed: editValues.completed,
            Date: editValues.date ? new Date(editValues.date).toISOString() : null,
          };
          break;
      }

      await api.put(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      setEditing(null);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };



  const deleteItem = async (type: TrackerType, trackerId: number) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      let endpoint = "";
      switch (type) {
        case "Mood": endpoint = `/api/Admin/mood/${trackerId}`; break;
        case "Sleep": endpoint = `/api/Admin/sleep/${trackerId}`; break;
        case "Steps": endpoint = `/api/Admin/steps/${trackerId}`; break;
        case "Hydration": endpoint = `/api/Admin/hydration/${trackerId}`; break;
        case "Habits": endpoint = `/api/Admin/habits/${trackerId}`; break;
      }
      await api.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete entry");
    }
  };

  const renderTracker = (title: string, arr: any[], type: TrackerType) => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      {Array.isArray(arr) && arr.length > 0 ? (
        arr.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded shadow mb-3">
            {editing?.type === type && editing.id === item.id ? (
              <div className="space-y-2">
                {type === "Mood" && (
                  <>
                    <input
                      type="text"
                      value={editValues.mood}
                      onChange={(e) => setEditValues({ ...editValues, mood: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Mood"
                    />
                    <textarea
                      value={editValues.notes}
                      onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Notes"
                    />
                    <input
                      type="datetime-local"
                      value={editValues.date?.substring(0, 16)}
                      onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </>
                )}
                {type === "Sleep" && (
                  <>
                    <label>Bed Time
                      <input type="datetime-local" value={editValues.BedTime} onChange={(e) => setEditValues({ ...editValues, BedTime: e.target.value })} className="w-full p-2 border rounded" />
                    </label>
                    <label>Wake Time
                      <input type="datetime-local" value={editValues.WakeUpTime} onChange={(e) => setEditValues({ ...editValues, WakeUpTime: e.target.value })} className="w-full p-2 border rounded" />
                    </label>
                    <label>Hours
                      <input type="number" value={editValues.Hours} onChange={(e) => setEditValues({ ...editValues, Hours: e.target.value })} className="w-full p-2 border rounded" />
                    </label>
                    <label>Quality
                      <select value={editValues.Quality} onChange={(e) => setEditValues({ ...editValues, Quality: e.target.value })} className="w-full p-2 border rounded">
                        <option>Good</option>
                        <option>Average</option>
                        <option>Poor</option>
                      </select>
                    </label>
                  </>
                )}
                {type === "Steps" && (
                  <>
                    <input type="number" value={editValues.StepsCount} onChange={(e) => setEditValues({ ...editValues, StepsCount: e.target.value })} className="w-full p-2 border rounded" placeholder="Steps Count" />
                    <select value={editValues.ActivityType} onChange={(e) => setEditValues({ ...editValues, ActivityType: e.target.value })} className="w-full p-2 border rounded">
                      <option value="walking">Walking</option>
                      <option value="running">Running</option>
                      <option value="cycling">Cycling</option>
                      <option value="hiking">Hiking</option>
                    </select>
                  </>
                )}
                {type === "Hydration" && (
                  <input type="number" value={editValues.WaterIntakeLiters} onChange={(e) => setEditValues({ ...editValues, WaterIntakeLiters: e.target.value })} className="w-full p-2 border rounded" placeholder="Water Intake (Liters)" />
                )}
                {type === "Habits" && (
                  <>
                    <input type="text" value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="w-full p-2 border rounded" placeholder="Habit Name" />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={editValues.completed} onChange={(e) => setEditValues({ ...editValues, completed: e.target.checked })} />
                      Completed
                    </label>
                  </>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-gray-700">
                  {type === "Mood" && (
                    <>
                      <p><strong>Mood:</strong> {item.mood}</p>
                      <p><strong>Notes:</strong> {item.notes}</p>
                      <p><strong>Date:</strong> {new Date(item.date).toLocaleString()}</p>
                    </>
                  )}
                  {type === "Sleep" && (
                    <>
                      <p><strong>Bed:</strong> {new Date(item.bedTime).toLocaleString()}</p>
                      <p><strong>Wake:</strong> {new Date(item.wakeUpTime).toLocaleString()}</p>
                      <p><strong>Hours:</strong> {item.hours}</p>
                      <p><strong>Quality:</strong> {item.quality}</p>
                    </>
                  )}
                  {type === "Steps" && (
                    <>
                      <p><strong>Steps:</strong> {item.stepsCount}</p>
                      <p><strong>Activity:</strong> {item.activityType}</p>
                    </>
                  )}
                  {type === "Hydration" && <p><strong>Water Intake:</strong> {item.waterIntakeLiters} L</p>}
                  {type === "Habits" && (
                    <>
                      <p><strong>Habit:</strong> {item.name}</p>
                      <p><strong>Completed:</strong> {item.completed ? "Yes" : "No"}</p>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button onClick={() => startEdit(type, item)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                  <button onClick={() => deleteItem(type, item.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No entries recorded.</p>
      )}
    </div>
  );

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6 text-gray-600">No user found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">User Details</h2>

      <div className="mb-6 bg-white p-4 shadow rounded">
        <p><strong>Name: </strong>{user.name}</p>
        <p><strong>Email: </strong>{user.email}</p>
        <p><strong>Roles: </strong>{user.roles?.join(", ")}</p>
      </div>

      <div className="bg-white p-4 shadow rounded">
        {renderTracker("Mood Entries", trackers.Mood, "Mood")}
        {renderTracker("Sleep Records", trackers.Sleep, "Sleep")}
        {renderTracker("Step Records", trackers.Steps, "Steps")}
        {renderTracker("Hydration Records", trackers.Hydration, "Hydration")}
        {renderTracker("Habits", trackers.Habits, "Habits")}
      </div>
    </div>
  );
}
