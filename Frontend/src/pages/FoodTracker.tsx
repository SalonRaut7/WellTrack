import React, { useEffect, useState } from "react";
import type { FoodEntryDTO } from "../api/foodApi";
import { getTodayFood, addFood, updateFood, deleteFood, searchUsdaFood } from "../api/foodApi";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function FoodTracker() {
  const [entries, setEntries] = useState<(FoodEntryDTO & { id: number })[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [form, setForm] = useState<FoodEntryDTO>({
    id: 0,
    foodName: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servingSize: "1",
    mealType: "Breakfast",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadToday();
  }, []);

  const loadToday = async () => {
    try {
      const data = await getTodayFood();
      const safeEntries = data.entries.map((e) => ({ ...e, id: e.id ?? 0 }));
      setEntries(safeEntries);
      setTotals(data.totals);
    } catch (err) {
      console.error("Error loading today's food:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleAddOrUpdate = async () => {
    if (!editingId && !String(form.foodName || "").trim()) return;

    try {
      const payload: FoodEntryDTO = {
        id: form.id,
        foodName: form.foodName,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        servingSize: String(form.servingSize),
        mealType: form.mealType,
      };

      if (editingId !== null) {
        await updateFood(editingId, payload);
      } else {
        await addFood(payload);
      }

      setForm({
        id: 0,
        foodName: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        servingSize: "1",
        mealType: "Breakfast",
      });
      setEditingId(null);
      loadToday();
    } catch (err) {
      console.error("Error adding/updating food:", err);
    }
  };

  const handleEdit = (entry: FoodEntryDTO & { id: number }) => {
    setForm({ ...entry, servingSize: entry.servingSize ?? "1" });
    setEditingId(entry.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFood(id);
      loadToday();
    } catch (err) {
      console.error("Error deleting food:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const result = await searchUsdaFood(searchQuery);
      setSearchResults(result.foods || []);
    } catch (err) {
      console.error("Error searching USDA:", err);
    }
  };

  const handleSelectSearch = (food: any) => {
    const getNutrient = (name: string) =>
      food.foodNutrients?.find((n: any) => n.nutrientName === name)?.value ?? 0;

    setForm({
      id: 0,
      foodName: food.description ?? "",
      calories: getNutrient("Energy"),
      protein: getNutrient("Protein"),
      carbs: getNutrient("Carbohydrate, by difference"),
      fat: getNutrient("Total lipid (fat)"),
      servingSize: "1",
      mealType: "Breakfast",
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  // Dark/glass UI styles to match Dashboard
  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const mealChip = (meal: string) => {
    switch ((meal || "").toLowerCase()) {
      case "breakfast":
        return "border-amber-400/20 bg-amber-500/10 text-amber-100";
      case "lunch":
        return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
      case "dinner":
        return "border-indigo-400/20 bg-indigo-500/10 text-indigo-100";
      case "snack":
        return "border-rose-400/20 bg-rose-500/10 text-rose-100";
      default:
        return "border-white/10 bg-white/10 text-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(244,63,94,0.16),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(245,158,11,0.12),transparent_50%)]" />
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Food Tracker</h1>
                <p className="mt-1 text-sm text-slate-300">Search foods, log meals, and track daily macros.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100">
                  Entries: {entries.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Search USDA food database</span>
              <input
                type="text"
                placeholder="e.g. banana, chicken breast, oats..."
                className={InputBase + " mt-1"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>

            <button
              className={[
                ButtonBase,
                "h-[42px] text-white relative overflow-hidden",
                "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500",
                "shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)]",
                "hover:-translate-y-[1px]",
              ].join(" ")}
              onClick={handleSearch}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100 bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]"
                aria-hidden="true"
              />
              <span className="relative">Search</span>
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                Results
              </div>
              <ul className="max-h-72 overflow-auto divide-y divide-white/10">
                {searchResults.map((food) => (
                  <li
                    key={food.fdcId}
                    className="cursor-pointer px-4 py-3 text-sm text-slate-100 hover:bg-white/5"
                    onClick={() => handleSelectSearch(food)}
                  >
                    <div className="font-semibold text-white">{food.description}</div>
                    {food.brandName ? <div className="text-xs text-slate-300">{food.brandName}</div> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{editingId !== null ? "Edit entry" : "Add entry"}</div>
              <div className="text-xs text-slate-300">Fill in macros (or search and select above).</div>
            </div>

            {editingId !== null && (
              <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
                Editing mode
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-300">Food Name</span>
              <input
                type="text"
                name="foodName"
                placeholder="Food Name"
                value={form.foodName}
                onChange={handleChange}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Calories</span>
              <input
                type="number"
                name="calories"
                placeholder="Calories"
                value={form.calories}
                onChange={handleChange}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Servings</span>
              <input
                type="number"
                name="servingSize"
                placeholder="Servings"
                value={form.servingSize}
                onChange={handleChange}
                className={InputBase + " mt-1"}
                min={1}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Protein (g)</span>
              <input
                type="number"
                name="protein"
                placeholder="Protein"
                value={form.protein}
                onChange={handleChange}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Carbs (g)</span>
              <input
                type="number"
                name="carbs"
                placeholder="Carbs"
                value={form.carbs}
                onChange={handleChange}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Fat (g)</span>
              <input
                type="number"
                name="fat"
                placeholder="Fat"
                value={form.fat}
                onChange={handleChange}
                className={InputBase + " mt-1"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Meal Type</span>
              <select name="mealType" value={form.mealType} onChange={handleChange} className={InputBase + " mt-1"}>
                {mealTypes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100">
              <span className="font-semibold text-white">Preview:</span>{" "}
              {form.foodName ? form.foodName : <span className="text-slate-400">Food name</span>} ·{" "}
              <span className="font-semibold text-white">{form.mealType}</span> ·{" "}
              <span className="font-semibold text-white">{form.servingSize || "1"}</span> serving(s)
            </div>

            <button
              onClick={handleAddOrUpdate}
              disabled={!editingId && !String(form.foodName || "").trim()}
              className={[
                ButtonBase,
                "relative overflow-hidden",
                !editingId && !String(form.foodName || "").trim()
                  ? "bg-white/10 text-slate-400 cursor-not-allowed border border-white/10"
                  : "text-white bg-gradient-to-r from-emerald-600 to-lime-500 shadow-[0_16px_45px_-30px_rgba(16,185,129,0.6)] hover:-translate-y-[1px]",
              ].join(" ")}
            >
              <span
                className={[
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
                  "bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]",
                  !editingId && !String(form.foodName || "").trim() ? "hidden" : "hover:opacity-100",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="relative">{editingId !== null ? "Update" : "Add"}</span>
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Today's Entries</h2>
              <p className="mt-1 text-xs text-slate-300">Macros are multiplied by servings.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5">
                  <tr className="text-left text-xs font-semibold text-slate-200">
                    <th className="p-3">Food</th>
                    <th className="p-3">Calories</th>
                    <th className="p-3">Protein</th>
                    <th className="p-3">Carbs</th>
                    <th className="p-3">Fat</th>
                    <th className="p-3">Servings</th>
                    <th className="p-3">Meal</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {entries.map((e) => {
                    const multiplier = Number(e.servingSize) || 1;
                    return (
                      <tr key={e.id} className="text-sm text-slate-100 hover:bg-white/5">
                        <td className="p-3">
                          <div className="font-semibold text-white">{e.foodName}</div>
                        </td>
                        <td className="p-3 tabular-nums">{e.calories * multiplier}</td>
                        <td className="p-3 tabular-nums">{e.protein * multiplier}</td>
                        <td className="p-3 tabular-nums">{e.carbs * multiplier}</td>
                        <td className="p-3 tabular-nums">{e.fat * multiplier}</td>
                        <td className="p-3 tabular-nums">{e.servingSize}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${mealChip(
                              e.mealType
                            )}`}
                          >
                            {e.mealType}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(e)}
                              className={
                                SmallButtonBase +
                                " border border-amber-400/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15 hover:-translate-y-[1px]"
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className={
                                SmallButtonBase +
                                " border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15 hover:-translate-y-[1px]"
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-sm text-slate-300">
                        No entries yet. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Today's Totals</h3>
            <p className="mt-1 text-xs text-slate-300">A quick snapshot of your macro totals.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <TotalCard label="Calories" value={totals.calories} suffix="kcal" accent="from-rose-500 to-red-500" />
            <TotalCard label="Protein" value={totals.protein} suffix="g" accent="from-indigo-500 to-sky-500" />
            <TotalCard label="Carbs" value={totals.carbs} suffix="g" accent="from-emerald-500 to-lime-500" />
            <TotalCard label="Fat" value={totals.fat} suffix="g" accent="from-fuchsia-500 to-pink-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix: string;
  accent: string;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl",
        "border border-white/10 bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)]",
        "transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
      ].join(" ")}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
      <div className="relative p-4">
        <div className="text-xs font-medium text-slate-300">{label}</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight text-white tabular-nums">
          {value} <span className="text-sm font-semibold text-slate-300">{suffix}</span>
        </div>
      </div>
    </div>
  );
}