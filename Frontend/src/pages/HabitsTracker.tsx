import React, { useState } from "react";

const HabitsTracker: React.FC = () => {
  const [habits, setHabits] = useState<string[]>([]);
  const [habitInput, setHabitInput] = useState("");

  const addHabit = () => {
    if (habitInput.trim() && !habits.includes(habitInput)) {
      setHabits([...habits, habitInput]);
      setHabitInput("");
    }
  };

  const removeHabit = (habit: string) => {
    setHabits(habits.filter((h) => h !== habit));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Habits Tracker</h2>
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={habitInput}
            onChange={(e) => setHabitInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Add new habit"
          />
          <button onClick={addHabit} className="px-4 py-2 bg-blue-600 text-white rounded">
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {habits.map((h) => (
            <li key={h} className="flex justify-between items-center p-2 border rounded">
              {h}
              <button onClick={() => removeHabit(h)} className="text-red-500">Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HabitsTracker;
