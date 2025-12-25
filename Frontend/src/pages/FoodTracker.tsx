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

  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";
  const SmallButtonBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.99]";

  const mealChip = (meal: string) => {
    switch ((meal || "").toLowerCase()) {
      case "breakfast":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "lunch":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "dinner":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";
      case "snack":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 opacity-15" />
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Food Tracker</h1>
                <p className="mt-1 text-sm text-slate-500">Search foods, log meals, and track daily macros.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  Entries: {entries.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Search USDA food database</span>
              <input
                type="text"
                placeholder="e.g. banana, chicken breast, oats..."
                className={InputBase + " mt-1"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>

            <button
              className={ButtonBase + " bg-indigo-600 text-white hover:bg-indigo-700 h-[42px]"}
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">Results</div>
              <ul className="max-h-72 overflow-auto divide-y divide-slate-100">
                {searchResults.map((food) => (
                  <li
                    key={food.fdcId}
                    className="cursor-pointer px-4 py-3 text-sm text-slate-800 hover:bg-slate-50"
                    onClick={() => handleSelectSearch(food)}
                  >
                    <div className="font-semibold">{food.description}</div>
                    {food.brandName ? <div className="text-xs text-slate-500">{food.brandName}</div> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">{editingId !== null ? "Edit entry" : "Add entry"}</div>
              <div className="text-xs text-slate-500">Fill in macros (or search and select above).</div>
            </div>

            {editingId !== null && (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                Editing mode
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Food Name</span>
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
              <span className="text-xs font-medium text-slate-600">Calories</span>
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
              <span className="text-xs font-medium text-slate-600">Servings</span>
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
              <span className="text-xs font-medium text-slate-600">Protein (g)</span>
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
              <span className="text-xs font-medium text-slate-600">Carbs (g)</span>
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
              <span className="text-xs font-medium text-slate-600">Fat (g)</span>
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
              <span className="text-xs font-medium text-slate-600">Meal Type</span>
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold">Preview:</span>{" "}
              {form.foodName ? form.foodName : <span className="text-slate-400">Food name</span>} ·{" "}
              <span className="font-semibold">{form.mealType}</span> ·{" "}
              <span className="font-semibold">{form.servingSize || "1"}</span> serving(s)
            </div>

            <button
              onClick={handleAddOrUpdate}
              disabled={!editingId && !String(form.foodName || "").trim()}
              className={[
                ButtonBase,
                !editingId && !String(form.foodName || "").trim()
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700",
              ].join(" ")}
            >
              {editingId !== null ? "Update" : "Add"}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Today's Entries</h2>
              <p className="mt-1 text-xs text-slate-500">Macros are multiplied by servings.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-600">
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
                <tbody className="divide-y divide-slate-100">
                  {entries.map((e) => {
                    const multiplier = Number(e.servingSize) || 1;
                    return (
                      <tr key={e.id} className="text-sm text-slate-800 hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{e.foodName}</div>
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
                                " border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className={
                                SmallButtonBase +
                                " border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
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
                      <td colSpan={8} className="p-6 text-center text-sm text-slate-500">
                        No entries yet. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Today's Totals</h3>
            <p className="mt-1 text-xs text-slate-500">A quick snapshot of your macro totals.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <TotalCard label="Calories" value={totals.calories} suffix="kcal" accent="from-rose-600 to-red-500" />
            <TotalCard label="Protein" value={totals.protein} suffix="g" accent="from-indigo-600 to-sky-500" />
            <TotalCard label="Carbs" value={totals.carbs} suffix="g" accent="from-emerald-600 to-lime-500" />
            <TotalCard label="Fat" value={totals.fat} suffix="g" accent="from-fuchsia-600 to-pink-500" />
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
        {value} <span className="text-sm font-semibold text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}