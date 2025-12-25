import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Moon,
  Footprints,
  Droplets,
  CheckCircle2,
  BarChart3,
  Shield,
  Users,
  FileText,
  Utensils,
  LogIn,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const [profile, setProfile] = useState<{
    profileImageUrl?: string | null;
    name?: string | null;
  } | null>(null);

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

  const initials = (profile?.name || auth.user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayName = profile?.name || auth.user?.email || "User";

  const isActive = (to: string) => {
    if (to === "/admin") return location.pathname === "/admin";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white shadow-sm flex items-center justify-center font-extrabold">
                W
              </div>
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 opacity-20 blur" />
            </div>

            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight text-slate-900">
                WellTrack
              </div>
              <div className="text-xs text-slate-500">Personal wellness tracker</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {items.map((it) => {
              const Icon = it.icon;
              const active = isActive(it.to);

              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={[
                    "group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-100",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                  title={it.label}
                >
                  <Icon
                    className={[
                      "h-4 w-4 transition",
                      active ? "text-white" : "text-slate-500 group-hover:text-slate-800",
                    ].join(" ")}
                  />
                  <span className="hidden lg:inline">{it.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {auth.isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  className={[
                    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5",
                    "shadow-sm transition hover:bg-slate-50",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-100",
                  ].join(" ")}
                  aria-haspopup="menu"
                  aria-expanded={open}
                >
                  <span className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-700">
                    {profile?.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-extrabold">{initials}</span>
                    )}
                  </span>

                  <span className="hidden sm:block max-w-[160px] truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </span>

                  <ChevronDown
                    className={[
                      "h-4 w-4 text-slate-500 transition",
                      open ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {open && (
                  <div
                    className={[
                      "absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg",
                      "ring-1 ring-black/5",
                    ].join(" ")}
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {profile?.name || "Account"}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {auth.user?.email || ""}
                      </div>
                      {isAdmin && (
                        <div className="mt-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Admin
                        </div>
                      )}
                    </div>

                    <div className="py-2">
                      {/* Remove Profile option for Admin */}
                      {!isAdmin && (
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate("/profile");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          role="menuitem"
                        >
                          <User className="h-4 w-4 text-slate-500" />
                          Profile
                        </button>
                      )}

                      <button
                        onClick={() => {
                          auth.logout();
                          navigate("/", { replace: true });
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 text-rose-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm",
                  "transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-100",
                ].join(" ")}
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-2">
          <div className="flex items-center justify-between py-2">
            {items.slice(0, 5).map((it) => {
              const Icon = it.icon;
              const active = isActive(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={[
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition",
                    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4",
                      active ? "text-white" : "text-slate-500",
                    ].join(" ")}
                  />
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}