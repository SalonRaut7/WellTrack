import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Footprints, TrendingUp } from "lucide-react";

const StepsTracker: React.FC = () => {
  const [steps, setSteps] = useState(10000);
  const [activity, setActivity] = useState("walking");

  const stepsData = [
    { day: "Mon", steps: 8200 },
    { day: "Tue", steps: 9500 },
    { day: "Wed", steps: 7300 },
    { day: "Thu", steps: 10100 },
    { day: "Fri", steps: 8900 },
    { day: "Sat", steps: 12000 },
    { day: "Sun", steps: 6500 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Steps & Activity Tracker</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">Log Activity</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-1 font-medium">
                <Footprints /> Steps
              </label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="mb-1 font-medium">Activity</label>
              <div className="flex gap-2">
                {["walking", "running", "cycling", "hiking"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActivity(type)}
                    className={`px-3 py-2 rounded ${activity === type ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Today's Steps</p>
            <p className="text-3xl font-bold">{steps.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Weekly Steps</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="steps" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Steps Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StepsTracker;
