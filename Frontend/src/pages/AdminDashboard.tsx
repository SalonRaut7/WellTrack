import { useEffect, useState } from "react";
import api from "../api/axios";

interface Stats {
  totalUsers: number;
  totalMoodEntries: number;
  totalSleepRecords: number;
  totalStepsRecords: number;
  totalHydrationRecords: number;
  totalHabitEntries: number;
  totalFoodEntries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get<Stats>("/api/Admin/reports");
        setStats(resp.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load stats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statItems = stats
    ? [
        { title: "Total Users", value: stats.totalUsers },
        { title: "Mood Entries", value: stats.totalMoodEntries },
        { title: "Sleep Records", value: stats.totalSleepRecords },
        { title: "Steps Records", value: stats.totalStepsRecords },
        { title: "Hydration Records", value: stats.totalHydrationRecords },
        { title: "Habit Entries", value: stats.totalHabitEntries },
        { title: "Food Entries", value: stats.totalFoodEntries },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-gray-200 p-6 rounded-xl animate-pulse h-28" />
            ))}
        </div>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {!loading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {statItems.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
