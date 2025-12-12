import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Moon, Footprints, Droplets, CheckCircle2, BarChart3, LogOut, Shield, Users, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const isAdmin = auth.user?.roles?.includes("Admin");

  const userItems = [
    { to: "/dashboard", label: "Dashboard", icon: Heart },
    { to: "/mood", label: "Mood", icon: Heart },
    { to: "/sleep", label: "Sleep", icon: Moon },
    { to: "/steps", label: "Steps", icon: Footprints },
    { to: "/hydration", label: "Hydration", icon: Droplets },
    { to: "/habits", label: "Habits", icon: CheckCircle2 },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const adminItems = [
    { to: "/admin", label: "Dashboard", icon: Shield },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/reports", label: "Reports", icon: FileText },
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b shadow z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">W</div>
          <div>
            <div className="text-lg font-bold">WellTrack</div>
            <div className="text-xs text-gray-500">Personal wellness tracker</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = location.pathname === it.to;
            return (
              <Link key={it.to} to={it.to} className={`flex items-center gap-2 px-3 py-2 rounded ${active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <Icon className="w-4 h-4" /> <span className="hidden lg:inline">{it.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {auth.isAuthenticated && (
            <button
              onClick={() => { auth.logout(); navigate("/login"); }}
              className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 text-red-600"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
