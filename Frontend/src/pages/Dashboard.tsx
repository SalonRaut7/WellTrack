import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 mb-2">Total Steps This Week</p>
          <p className="text-3xl font-bold">75,300</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 mb-2">Sleep Average</p>
          <p className="text-3xl font-bold">7h 30m</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 mb-2">Hydration</p>
          <p className="text-3xl font-bold">2.1L</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
