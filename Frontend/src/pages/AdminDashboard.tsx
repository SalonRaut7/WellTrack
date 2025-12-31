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
        {
          title: "Total Users",
          value: stats.totalUsers,
          color: "from-indigo-500 to-sky-500",
          chip: "bg-indigo-500/10 text-indigo-100 border-indigo-400/20",
          glow: "bg-indigo-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        },
        {
          title: "Mood Entries",
          value: stats.totalMoodEntries,
          color: "from-fuchsia-500 to-pink-500",
          chip: "bg-fuchsia-500/10 text-fuchsia-100 border-fuchsia-400/20",
          glow: "bg-fuchsia-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
          ),
        },
        {
          title: "Sleep Records",
          value: stats.totalSleepRecords,
          color: "from-indigo-500 to-sky-500",
          chip: "bg-indigo-500/10 text-indigo-100 border-indigo-400/20",
          glow: "bg-indigo-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
          ),
        },
        {
          title: "Steps Records",
          value: stats.totalStepsRecords,
          color: "from-emerald-500 to-lime-500",
          chip: "bg-emerald-500/10 text-emerald-100 border-emerald-400/20",
          glow: "bg-emerald-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 5a3 3 0 1 0-3 3" />
              <path d="M7 21v-6l4-3 3 2 2 7" />
              <path d="M9 15l-2 2" />
              <path d="M14 13l1-3 3-2" />
            </svg>
          ),
        },
        {
          title: "Hydration Records",
          value: stats.totalHydrationRecords,
          color: "from-sky-500 to-cyan-500",
          chip: "bg-sky-500/10 text-sky-100 border-sky-400/20",
          glow: "bg-sky-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2s7 7.4 7 13a7 7 0 0 1-14 0c0-5.6 7-13 7-13Z" />
            </svg>
          ),
        },
        {
          title: "Habit Entries",
          value: stats.totalHabitEntries,
          color: "from-amber-500 to-orange-500",
          chip: "bg-amber-500/10 text-amber-100 border-amber-400/20",
          glow: "bg-amber-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          ),
        },
        {
          title: "Food Entries",
          value: stats.totalFoodEntries,
          color: "from-rose-500 to-red-500",
          chip: "bg-rose-500/10 text-rose-100 border-rose-400/20",
          glow: "bg-rose-500/12",
          icon: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 3h16" />
              <path d="M6 3v8a6 6 0 0 0 12 0V3" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl p-6">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.14),transparent_50%)]" />
            <div className="relative flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Admin Dashboard</h2>
              <p className="text-sm text-slate-300">System-wide statistics and usage overview</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-white/10" />
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
                    <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
                    <div className="h-7 w-20 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-400/20 bg-white/[0.06] p-5 text-rose-200 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        )}

        {!loading && stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item) => (
              <StatCard
                key={item.title}
                title={item.title}
                value={item.value}
                icon={item.icon}
                gradient={item.color}
                chipClass={item.chip}
                glowClass={item.glow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  chipClass,
  glowClass,
}: {
  title: string;
  value: number;
  icon?: React.ReactNode;
  gradient: string;
  chipClass: string;
  glowClass: string;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl",
        "border border-white/10 bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)]",
        "transition-all duration-300",
        "hover:-translate-y-[2px] hover:shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
      ].join(" ")}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />

      <div
        className={[
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl",
          glowClass,
          "opacity-60 transition-opacity duration-300 group-hover:opacity-90",
        ].join(" ")}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className={[
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white",
              `bg-gradient-to-r ${gradient}`,
              "shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)]",
              "transition-transform duration-300 group-hover:scale-[1.05]",
            ].join(" ")}
          >
            {icon}
          </div>

          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClass}`}>
            Total
          </span>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium text-slate-300">{title}</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight text-white tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  );
}