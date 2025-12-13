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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Food Tracker</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search food..."
          className="border p-2 mr-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSearch}>
          Search
        </button>
        {searchResults.length > 0 && (
          <ul className="border mt-2 max-h-60 overflow-auto">
            {searchResults.map((food) => (
              <li
                key={food.fdcId}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectSearch(food)}
              >
                {food.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6 border p-4 rounded">
        <label className="block mb-1 font-semibold">Food Name</label>
        <input
          type="text"
          name="foodName"
          placeholder="Food Name"
          value={form.foodName}
          onChange={handleChange}
          className="border p-2 mb-2 w-full"
        />

        <label className="block mb-1 font-semibold">Calories</label>
        <input type="number" name="calories" placeholder="Calories" value={form.calories} onChange={handleChange} className="border p-2 mb-2 w-full" />

        <label className="block mb-1 font-semibold">Protein (g)</label>
        <input type="number" name="protein" placeholder="Protein" value={form.protein} onChange={handleChange} className="border p-2 mb-2 w-full" />

        <label className="block mb-1 font-semibold">Carbs (g)</label>
        <input type="number" name="carbs" placeholder="Carbs" value={form.carbs} onChange={handleChange} className="border p-2 mb-2 w-full" />

        <label className="block mb-1 font-semibold">Fat (g)</label>
        <input type="number" name="fat" placeholder="Fat" value={form.fat} onChange={handleChange} className="border p-2 mb-2 w-full" />

        <label className="block mb-1 font-semibold">Servings</label>
        <input type="number" name="servingSize" placeholder="Servings" value={form.servingSize} onChange={handleChange} className="border p-2 mb-2 w-full" min={1} />

        <label className="block mb-1 font-semibold">Meal Type</label>
        <select name="mealType" value={form.mealType} onChange={handleChange} className="border p-2 mb-2 w-full">
          {mealTypes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <button onClick={handleAddOrUpdate} className="bg-green-600 text-white px-4 py-2 rounded">
          {editingId !== null ? "Update" : "Add"}
        </button>
      </div>

      <h2 className="text-xl font-bold mb-2">Today's Entries</h2>
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Food</th>
            <th className="p-2">Calories</th>
            <th className="p-2">Protein</th>
            <th className="p-2">Carbs</th>
            <th className="p-2">Fat</th>
            <th className="p-2">Servings</th>
            <th className="p-2">Meal</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const multiplier = Number(e.servingSize) || 1;
            return (
              <tr key={e.id}>
                <td className="p-2">{e.foodName}</td>
                <td className="p-2">{e.calories * multiplier}</td>
                <td className="p-2">{e.protein * multiplier}</td>
                <td className="p-2">{e.carbs * multiplier}</td>
                <td className="p-2">{e.fat * multiplier}</td>
                <td className="p-2">{e.servingSize}</td>
                <td className="p-2">{e.mealType}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(e)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border p-4 rounded">
        <h3 className="font-bold">Today's Totals</h3>
        <p>Calories: {totals.calories}</p>
        <p>Protein: {totals.protein}g</p>
        <p>Carbs: {totals.carbs}g</p>
        <p>Fat: {totals.fat}g</p>
      </div>
    </div>
  );
}
