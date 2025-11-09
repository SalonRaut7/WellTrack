import React, { useState } from "react";

const HydrationTracker: React.FC = () => {
  const [water, setWater] = useState<number>(2000);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Hydration Tracker</h2>
      <div className="bg-white p-6 rounded-xl shadow">
        <label className="block mb-2 font-medium">Water Intake (ml)</label>
        <input
          type="number"
          value={water}
          onChange={(e) => setWater(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
        <p className="mt-4 text-gray-700">You drank {water} ml today.</p>
      </div>
    </div>
  );
};

export default HydrationTracker;
