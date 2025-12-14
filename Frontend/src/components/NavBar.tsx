import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Moon, Footprints, Droplets, CheckCircle2, BarChart3, Shield, Users, FileText, Utensils } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const [profile, setProfile] = useState<{ profileImageUrl?: string | null; name?: string | null } | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!auth.isAuthenticated) return;
      try {
        const resp = await api.get("/api/profile/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setProfile(resp.data);
      } catch (err) {
        // ignore
      }
    };
    load();
  }, [auth.isAuthenticated]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const isAdmin = auth.user?.roles?.includes("Admin");

  const userItems = [
    { to: "/dashboard", label: "Dashboard", icon: Heart },
    { to: "/mood", label: "Mood", icon: Heart },
    { to: "/sleep", label: "Sleep", icon: Moon },
    { to: "/steps", label: "Steps", icon: Footprints },
    { to: "/hydration", label: "Hydration", icon: Droplets },
    { to: "/habits", label: "Habits", icon: CheckCircle2 },
    { to: "/food", label: "Food", icon: Utensils },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const adminItems = [
    { to: "/admin", label: "Dashboard", icon: Shield },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/reports", label: "Reports", icon: FileText },
  ];

  const items = isAdmin ? adminItems : userItems;

  const initials = (profile?.name || auth.user?.email || "U").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

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
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(o => !o)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 overflow-hidden"
                >
                  {profile?.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold">{initials}</span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-1 z-50">
                    <button
                      onClick={() => { setOpen(false); navigate("/profile"); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => { auth.logout(); navigate("/", { replace: true }); }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!auth.isAuthenticated && (
            <button
              onClick={() => { navigate("/login"); }}
              className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

