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
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAppNotifications } from "../notifications/NotificationProvider";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const { notifications, clearNotifications } = useAppNotifications();

  const [profile, setProfile] = useState<{
    profileImageUrl?: string | null;
    name?: string | null;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

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

      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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

  const notifCount = notifications.length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.18),transparent_50%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={[
            "absolute -top-24 left-[12%] h-40 w-40 rounded-full blur-3xl",
            "bg-indigo-500/15",
            "animate-[float_10s_ease-in-out_infinite]",
          ].join(" ")}
        />
        <div
          className={[
            "absolute -top-16 right-[10%] h-44 w-44 rounded-full blur-3xl",
            "bg-sky-500/12",
            "animate-[float_12s_ease-in-out_infinite]",
          ].join(" ")}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,10px,0); }
        }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={[
                  "h-10 w-10 rounded-2xl text-white shadow-sm flex items-center justify-center font-extrabold",
                  "bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500",
                  "transition-transform duration-300 will-change-transform",
                  "hover:scale-[1.03] active:scale-[0.98]",
                ].join(" ")}
              >
                W
              </div>
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 opacity-25 blur" />
            </div>

            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight text-white">WellTrack</div>
              <div className="text-xs text-slate-300">Personal wellness tracker</div>
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
                    "group relative inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold",
                    "transition-all duration-300",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                    "hover:-translate-y-[1px]",
                    active ? "text-white" : "text-slate-200 hover:text-white",
                  ].join(" ")}
                  title={it.label}
                >
                  <span
                    className={[
                      "absolute inset-0 rounded-2xl transition-all duration-300",
                      active
                        ? "bg-white/10 border border-white/10 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.9)]"
                        : "bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  <span
                    className={[
                      "pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.16),transparent_40%)]",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  <Icon
                    className={[
                      "relative z-10 h-4 w-4 transition-transform duration-300",
                      "group-hover:scale-110",
                      active ? "text-white" : "text-slate-300",
                    ].join(" ")}
                  />
                  <span className="relative z-10 hidden lg:inline">{it.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {auth.isAuthenticated && !isAdmin ? (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className={[
                    "group inline-flex items-center justify-center",
                    "h-10 w-10 rounded-2xl",
                    "bg-white/10 backdrop-blur-xl border border-white/10",
                    "shadow-[0_18px_50px_-42px_rgba(0,0,0,0.9)]",
                    "transition-all duration-300 hover:bg-white/15 hover:-translate-y-[1px]",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                  ].join(" ")}
                  aria-haspopup="menu"
                  aria-expanded={notifOpen}
                  title="Notifications"
                >
                  <Bell className="h-4 w-4 text-slate-200" />

                  {notifCount > 0 && (
                    <span
                      className={[
                        "absolute -top-1 -right-1 min-w-5 h-5 px-1",
                        "rounded-full bg-rose-500 text-white",
                        "text-[11px] font-extrabold",
                        "flex items-center justify-center",
                        "ring-2 ring-slate-950/70",
                      ].join(" ")}
                    >
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    className={[
                      "absolute right-0 mt-2 w-[340px] max-w-[85vw] overflow-hidden rounded-2xl",
                      "bg-slate-950/70 backdrop-blur-2xl",
                      "border border-white/10",
                      "shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
                      "ring-1 ring-black/20",
                      "origin-top-right animate-[pop_180ms_ease-out]",
                    ].join(" ")}
                    role="menu"
                  >
                    <style>{`
                      @keyframes pop {
                        from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                      }
                    `}</style>

                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">Notifications</div>
                        <div className="text-xs text-slate-300">{notifCount} total</div>
                      </div>

                      <button
                        onClick={() => clearNotifications()}
                        disabled={notifCount === 0}
                        className={[
                          "shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                          notifCount === 0
                            ? "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                            : "border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15",
                          "transition-colors",
                        ].join(" ")}
                      >
                        Clear
                      </button>
                    </div>

                    <div className="max-h-80 overflow-auto">
                      {notifCount === 0 ? (
                        <div className="p-4 text-sm text-slate-300">No notifications yet.</div>
                      ) : (
                        <div className="divide-y divide-white/10">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-4 hover:bg-white/5">
                              <div className="min-w-0">
                                <div className="text-sm text-slate-100 leading-relaxed">
                                  {n.message}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {n.date}
                                  {n.type ? ` • ${n.type}` : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {auth.isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  className={[
                    "group inline-flex items-center gap-2 rounded-2xl px-2 py-1.5",
                    "bg-white/10 backdrop-blur-xl border border-white/10",
                    "shadow-[0_18px_50px_-42px_rgba(0,0,0,0.9)]",
                    "transition-all duration-300 hover:bg-white/15 hover:-translate-y-[1px]",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                  ].join(" ")}
                  aria-haspopup="menu"
                  aria-expanded={open}
                >
                  <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center text-slate-100">
                    {profile?.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-extrabold">{initials}</span>
                    )}
                    <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-indigo-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </span>

                  <span className="hidden sm:block max-w-[160px] truncate text-sm font-semibold text-white">
                    {displayName}
                  </span>

                  <ChevronDown
                    className={[
                      "h-4 w-4 text-slate-200 transition-transform duration-300",
                      open ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {open && (
                  <div
                    className={[
                      "absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl",
                      "bg-slate-950/70 backdrop-blur-2xl",
                      "border border-white/10",
                      "shadow-[0_28px_80px_-54px_rgba(0,0,0,0.95)]",
                      "ring-1 ring-black/20",
                      "origin-top-right animate-[pop_180ms_ease-out]",
                    ].join(" ")}
                    role="menu"
                  >
                    <style>{`
                      @keyframes pop {
                        from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                      }
                    `}</style>

                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-sm font-semibold text-white truncate">
                        {profile?.name || "Account"}
                      </div>
                      <div className="text-xs text-slate-300 truncate">{auth.user?.email || ""}</div>

                      {isAdmin && (
                        <div className="mt-2 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                          Admin
                        </div>
                      )}
                    </div>

                    <div className="py-2">
                      {!isAdmin && (
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate("/profile");
                          }}
                          className={[
                            "w-full px-4 py-2.5 text-left text-sm font-semibold",
                            "text-slate-100 hover:text-white",
                            "hover:bg-white/10 transition-colors",
                            "flex items-center gap-2",
                          ].join(" ")}
                          role="menuitem"
                        >
                          <User className="h-4 w-4 text-slate-300" />
                          Profile
                        </button>
                      )}

                      <button
                        onClick={() => {
                          auth.logout();
                          navigate("/", { replace: true });
                        }}
                        className={[
                          "w-full px-4 py-2.5 text-left text-sm font-semibold",
                          "text-rose-200 hover:bg-rose-500/10 transition-colors",
                          "flex items-center gap-2",
                        ].join(" ")}
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 text-rose-200" />
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
                  "relative inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                  "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500",
                  "shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)]",
                  "transition-all duration-300 hover:-translate-y-[1px]",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                ].join(" ")}
              >
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]"
                  aria-hidden="true"
                />
                <LogIn className="relative h-4 w-4" />
                <span className="relative">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative md:hidden border-t border-white/10 bg-slate-950/55 backdrop-blur-2xl">
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
                    "group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold",
                    "transition-all duration-300",
                    active ? "text-white" : "text-slate-200 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute inset-0 rounded-2xl transition-all duration-300",
                      active
                        ? "bg-white/10 border border-white/10"
                        : "bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <Icon
                    className={[
                      "relative h-4 w-4 transition-transform duration-300",
                      "group-hover:scale-110",
                      active ? "text-white" : "text-slate-300",
                    ].join(" ")}
                  />
                  <span className="relative truncate">{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}