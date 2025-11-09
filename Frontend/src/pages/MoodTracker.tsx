import React, { useState } from "react";

const MoodTracker: React.FC = () => {
  const [mood, setMood] = useState<string>("happy");

  const moods = ["happy", "sad", "angry", "relaxed"];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Mood Tracker</h2>
      <div className="flex gap-4">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`px-4 py-2 rounded ${mood === m ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <p className="mt-4 text-gray-700">Current mood: <strong>{mood}</strong></p>
    </div>
  );
};

export default MoodTracker;
