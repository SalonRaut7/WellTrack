import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

type TrackerType = "Mood" | "Sleep" | "Steps" | "Hydration" | "Habits" | "Food";

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
          Food: trackersResp.data.food || trackersResp.data.Food || [],
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
    else if (type === "Steps")
      setEditValues({ StepsCount: item.stepsCount, ActivityType: item.activityType, date: item.date });
    else if (type === "Hydration") setEditValues({ WaterIntakeLiters: item.waterIntakeLiters, date: item.date });
    else if (type === "Habits") setEditValues({ name: item.name, completed: item.completed, date: item.date });
    else if (type === "Food")
      setEditValues({
        FoodName: item.foodName,
        Calories: item.calories,
        Protein: item.protein,
        Carbs: item.carbs,
        Fat: item.fat,
        ServingSize: item.servingSize,
        MealType: item.mealType,
      });
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

        case "Food":
          endpoint = `/api/Admin/food/${trackerId}`;
          payload = {
            FoodName: editValues.FoodName,
            Calories: parseInt(editValues.Calories),
            Protein: parseFloat(editValues.Protein),
            Carbs: parseFloat(editValues.Carbs),
            Fat: parseFloat(editValues.Fat),
            ServingSize: editValues.ServingSize,
            MealType: editValues.MealType,
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
        case "Mood":
          endpoint = `/api/Admin/mood/${trackerId}`;
          break;
        case "Sleep":
          endpoint = `/api/Admin/sleep/${trackerId}`;
          break;
        case "Steps":
          endpoint = `/api/Admin/steps/${trackerId}`;
          break;
        case "Hydration":
          endpoint = `/api/Admin/hydration/${trackerId}`;
          break;
        case "Habits":
          endpoint = `/api/Admin/habits/${trackerId}`;
          break;
        case "Food":
          endpoint = `/api/Admin/food/${trackerId}`;
          break;
      }
      await api.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete entry");
    }
  };

  type WithChildren = { children: React.ReactNode; className?: string };


  const FieldLabel = ({ children, className = "" }: WithChildren) => (
    <span className={"text-xs font-medium text-slate-600 " + className}>{children}</span>
  );

  const InfoRow = ({
    label,
    value,
    valueClassName = "",
  }: {
    label: React.ReactNode;
    value: React.ReactNode;
    valueClassName?: string;
  }) => (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium text-slate-600">{label}:</span>
      <span className={"text-sm font-semibold text-slate-900 " + valueClassName}>{value}</span>
    </div>
  );

  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-60";
  const IconButtonBase =
    "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]";

  const trackerMeta: Record<
    TrackerType,
    { title: string; subtitle: string; accent: string; chip: string }
  > = {
    Mood: {
      title: "Mood",
      subtitle: "How the user felt",
      accent: "from-fuchsia-500 to-pink-500",
      chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    },
    Sleep: {
      title: "Sleep",
      subtitle: "Bed, wake & quality",
      accent: "from-indigo-500 to-sky-500",
      chip: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    Steps: {
      title: "Steps",
      subtitle: "Activity & count",
      accent: "from-emerald-500 to-lime-500",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    Hydration: {
      title: "Hydration",
      subtitle: "Water intake",
      accent: "from-sky-500 to-cyan-500",
      chip: "bg-sky-50 text-sky-700 border-sky-100",
    },
    Habits: {
      title: "Habits",
      subtitle: "Daily habit completion",
      accent: "from-amber-500 to-orange-500",
      chip: "bg-amber-50 text-amber-800 border-amber-100",
    },
    Food: {
      title: "Food",
      subtitle: "Meals & macros",
      accent: "from-rose-500 to-red-500",
      chip: "bg-rose-50 text-rose-700 border-rose-100",
    },
  };

  const renderTracker = (title: string, arr: any[], type: TrackerType) => {
    const meta = trackerMeta[type];

    return (
      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${meta.accent}`} />
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <span className={`ml-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.chip}`}>
                {Array.isArray(arr) ? arr.length : 0}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
          </div>
        </div>

        {Array.isArray(arr) && arr.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {arr.map((item: any) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${meta.accent}`} />
                <div className="p-4 sm:p-5">
                  {editing?.type === type && editing.id === item.id ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Editing {meta.title} entry</p>
                          <p className="text-xs text-slate-500">Make changes and save.</p>
                        </div>
                        {/* removed ID display (UI only) */}
                      </div>

                      {type === "Mood" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <FieldLabel>Mood</FieldLabel>
                            <input
                              type="text"
                              value={editValues.mood}
                              onChange={(e) => setEditValues({ ...editValues, mood: e.target.value })}
                              className={InputBase}
                              placeholder="Mood"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <FieldLabel>Date</FieldLabel>
                            <input
                              type="datetime-local"
                              value={editValues.date?.substring(0, 16)}
                              onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                              className={InputBase}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <FieldLabel>Notes</FieldLabel>
                            <textarea
                              value={editValues.notes}
                              onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                              className={`${InputBase} min-h-[96px]`}
                              placeholder="Notes"
                            />
                          </div>
                        </div>
                      )}

                      {type === "Sleep" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Bed Time</FieldLabel>
                            <input
                              type="datetime-local"
                              value={editValues.BedTime}
                              onChange={(e) => setEditValues({ ...editValues, BedTime: e.target.value })}
                              className={InputBase}
                            />
                          </div>
                          <div>
                            <FieldLabel>Wake Time</FieldLabel>
                            <input
                              type="datetime-local"
                              value={editValues.WakeUpTime}
                              onChange={(e) => setEditValues({ ...editValues, WakeUpTime: e.target.value })}
                              className={InputBase}
                            />
                          </div>
                          <div>
                            <FieldLabel>Hours</FieldLabel>
                            <input
                              type="number"
                              value={editValues.Hours}
                              onChange={(e) => setEditValues({ ...editValues, Hours: e.target.value })}
                              className={InputBase}
                            />
                          </div>
                          <div>
                            <FieldLabel>Quality</FieldLabel>
                            <select
                              value={editValues.Quality}
                              onChange={(e) => setEditValues({ ...editValues, Quality: e.target.value })}
                              className={InputBase}
                            >
                              <option>Good</option>
                              <option>Average</option>
                              <option>Poor</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {type === "Steps" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Steps Count</FieldLabel>
                            <input
                              type="number"
                              value={editValues.StepsCount}
                              onChange={(e) => setEditValues({ ...editValues, StepsCount: e.target.value })}
                              className={InputBase}
                              placeholder="Steps Count"
                            />
                          </div>
                          <div>
                            <FieldLabel>Activity Type</FieldLabel>
                            <select
                              value={editValues.ActivityType}
                              onChange={(e) => setEditValues({ ...editValues, ActivityType: e.target.value })}
                              className={InputBase}
                            >
                              <option value="walking">Walking</option>
                              <option value="running">Running</option>
                              <option value="cycling">Cycling</option>
                              <option value="hiking">Hiking</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {type === "Hydration" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Water Intake (Liters)</FieldLabel>
                            <input
                              type="number"
                              value={editValues.WaterIntakeLiters}
                              onChange={(e) =>
                                setEditValues({ ...editValues, WaterIntakeLiters: e.target.value })
                              }
                              className={InputBase}
                              placeholder="e.g. 2.5"
                            />
                          </div>
                        </div>
                      )}

                      {type === "Habits" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Habit Name</FieldLabel>
                            <input
                              type="text"
                              value={editValues.name}
                              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                              className={InputBase}
                              placeholder="Habit Name"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                              <span className="text-sm font-medium text-slate-700">Completed</span>
                              <input
                                type="checkbox"
                                checked={editValues.completed}
                                onChange={(e) => setEditValues({ ...editValues, completed: e.target.checked })}
                                className="h-4 w-4 accent-indigo-600"
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {type === "Food" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <FieldLabel>Food Name</FieldLabel>
                            <input
                              type="text"
                              value={editValues.FoodName}
                              onChange={(e) => setEditValues({ ...editValues, FoodName: e.target.value })}
                              className={InputBase}
                              placeholder="Food Name"
                            />
                          </div>
                          <div>
                            <FieldLabel>Calories</FieldLabel>
                            <input
                              type="number"
                              value={editValues.Calories}
                              onChange={(e) => setEditValues({ ...editValues, Calories: e.target.value })}
                              className={InputBase}
                              placeholder="Calories"
                            />
                          </div>
                          <div>
                            <FieldLabel>Meal Type</FieldLabel>
                            <select
                              value={editValues.MealType}
                              onChange={(e) => setEditValues({ ...editValues, MealType: e.target.value })}
                              className={InputBase}
                            >
                              <option>Breakfast</option>
                              <option>Lunch</option>
                              <option>Dinner</option>
                              <option>Snack</option>
                            </select>
                          </div>
                          <div>
                            <FieldLabel>Protein (g)</FieldLabel>
                            <input
                              type="number"
                              value={editValues.Protein}
                              onChange={(e) => setEditValues({ ...editValues, Protein: e.target.value })}
                              className={InputBase}
                              placeholder="Protein"
                            />
                          </div>
                          <div>
                            <FieldLabel>Carbs (g)</FieldLabel>
                            <input
                              type="number"
                              value={editValues.Carbs}
                              onChange={(e) => setEditValues({ ...editValues, Carbs: e.target.value })}
                              className={InputBase}
                              placeholder="Carbohydrates"
                            />
                          </div>
                          <div>
                            <FieldLabel>Fat (g)</FieldLabel>
                            <input
                              type="number"
                              value={editValues.Fat}
                              onChange={(e) => setEditValues({ ...editValues, Fat: e.target.value })}
                              className={InputBase}
                              placeholder="Fat"
                            />
                          </div>
                          <div>
                            <FieldLabel>Serving Size</FieldLabel>
                            <input
                              type="text"
                              value={editValues.ServingSize}
                              onChange={(e) => setEditValues({ ...editValues, ServingSize: e.target.value })}
                              className={InputBase}
                              placeholder="Serving Size"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                        <button
                          onClick={saveEdit}
                          className={`${ButtonBase} bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200`}
                        >
                          Save changes
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className={`${ButtonBase} bg-slate-100 text-slate-800 hover:bg-slate-200`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}
                          >
                            {meta.title}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                          {type === "Mood" && (
                            <>
                              <InfoRow label="Mood" value={item.mood} />
                              <InfoRow label="Date" value={new Date(item.date).toLocaleString()} />
                              <div className="space-y-1 sm:col-span-2">
                                <FieldLabel>Notes</FieldLabel>
                                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                  {item.notes || <span className="text-slate-400">No notes</span>}
                                </div>
                              </div>
                            </>
                          )}

                          {type === "Sleep" && (
                            <>
                              <InfoRow label="Bed" value={new Date(item.bedTime).toLocaleString()} />
                              <InfoRow label="Wake" value={new Date(item.wakeUpTime).toLocaleString()} />
                              <InfoRow label="Hours" value={item.hours} />
                              <InfoRow label="Quality" value={item.quality} />
                            </>
                          )}

                          {type === "Steps" && (
                            <>
                              <InfoRow label="Steps" value={item.stepsCount} />
                              <InfoRow label="Activity" value={item.activityType} valueClassName="capitalize" />
                            </>
                          )}

                          {type === "Hydration" && <InfoRow label="Water Intake" value={`${item.waterIntakeLiters} L`} />}

                          {type === "Habits" && (
                            <>
                              <InfoRow label="Habit" value={item.name} />
                              <InfoRow label="Completed" value={item.completed ? "Yes" : "No"} />
                            </>
                          )}

                          {type === "Food" && (
                            <>
                              <InfoRow label="Food" value={item.foodName} />
                              <InfoRow label="Calories" value={item.calories} />
                              <InfoRow label="Meal Type" value={item.mealType} />
                              <InfoRow label="Protein" value={`${item.protein} g`} />
                              <InfoRow label="Carbs" value={`${item.carbs} g`} />
                              <InfoRow label="Fat" value={`${item.fat} g`} />
                              <InfoRow label="Serving Size" value={item.servingSize} />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 sm:flex-col sm:items-stretch">
                        <button
                          onClick={() => startEdit(type, item)}
                          className={`${IconButtonBase} hover:border-indigo-200`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(type, item.id)}
                          className={`${IconButtonBase} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-medium text-slate-700">No entries recorded.</p>
            <p className="mt-1 text-xs text-slate-500">When the user adds data, it will show up here.</p>
          </div>
        )}
      </section>
    );
  };

  if (loading)
    return (
      <div className="min-h-[60vh] bg-slate-50">
        <div className="mx-auto max-w-5xl p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-[60vh] bg-slate-50">
        <div className="mx-auto max-w-5xl p-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
            <div className="text-sm font-semibold">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
            <button
              onClick={load}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-[60vh] bg-slate-50">
        <div className="mx-auto max-w-5xl p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
            No user found.
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 opacity-15" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  User Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">Admin overview of profile and trackers.</p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-medium text-slate-500">Name</div>
                    <div className="mt-1 truncate text-sm font-semibold text-slate-900">{user.name}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-medium text-slate-500">Email</div>
                    <div className="mt-1 truncate text-sm font-semibold text-slate-900">{user.email}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-medium text-slate-500">Roles</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {user.roles?.length ? user.roles.join(", ") : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={load} className={`${IconButtonBase} border-slate-200`}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {renderTracker("Mood Entries", trackers.Mood, "Mood")}
          {renderTracker("Sleep Records", trackers.Sleep, "Sleep")}
          {renderTracker("Step Records", trackers.Steps, "Steps")}
          {renderTracker("Hydration Records", trackers.Hydration, "Hydration")}
          {renderTracker("Habits", trackers.Habits, "Habits")}
          {renderTracker("Food Entries", trackers.Food, "Food")}
        </div>
      </div>
    </div>
  );
}