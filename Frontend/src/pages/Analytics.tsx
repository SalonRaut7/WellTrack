import React from "react";

const Analytics: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Analytics</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">Steps Analytics (Chart Placeholder)</div>
        <div className="bg-white p-6 rounded-xl shadow">Sleep Analytics (Chart Placeholder)</div>
        <div className="bg-white p-6 rounded-xl shadow">Hydration Analytics (Chart Placeholder)</div>
      </div>
    </div>
  );
};

export default Analytics;
