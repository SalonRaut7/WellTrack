import React, { useState } from "react";

const SleepTracker: React.FC = () => {
  const [sleepHours, setSleepHours] = useState<number>(8);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Sleep Tracker</h2>
      <div className="bg-white p-6 rounded-xl shadow">
        <label className="block mb-2 font-medium">Sleep Duration (hours)</label>
        <input
          type="number"
          value={sleepHours}
          onChange={(e) => setSleepHours(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
        <p className="mt-4 text-gray-700">You slept {sleepHours} hours today.</p>
      </div>
    </div>
  );
};

export default SleepTracker;
