import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const currentUser = JSON.parse(localStorage.getItem("userRoles") || "[]");
      const roles = currentUser as string[];
      if (roles.includes("Admin")) {
        navigate("/admin");
        return;
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      let msg = "Invalid credentials";
      if (err?.response?.data) {
        msg =
          err.response.data.message ||
          err.response.data.detail ||
          JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      setPassword("");
    }
  };

  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const CardBase =
    "rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className={"mb-6 overflow-hidden " + CardBase}>
            <div className="relative p-6 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(56,189,248,0.16),transparent_50%)]" />
              <div className="relative flex items-start gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 text-white font-extrabold shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)]">
                    W
                  </div>
                  <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 opacity-25 blur" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold tracking-tight text-white">Welcome back</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Log in to WellTrack — your personal wellness companion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={CardBase + " p-5 sm:p-6"}>
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <div className="font-semibold text-white">Login failed</div>
                <div className="mt-1">{error}</div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" autoComplete="off">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Email</span>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    name="username"
                    autoComplete="username"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={InputBase + " pl-9"}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-300">Password</span>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    name="password"
                    autoComplete="current-password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={InputBase + " pl-9 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white"
                    tabIndex={-1}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <Link to="/forgot" className="font-semibold text-sky-200 hover:text-white hover:underline">
                  Forgot password?
                </Link>
                <Link to="/register" className="font-semibold text-emerald-200 hover:text-white hover:underline">
                  Create account
                </Link>
              </div>

              <button
                type="submit"
                className={[
                  ButtonBase,
                  "relative overflow-hidden text-white",
                  "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500",
                  "shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)]",
                  "hover:-translate-y-[1px]",
                ].join(" ")}
              >
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100 bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]"
                  aria-hidden="true"
                />
                <span className="relative">Login</span>
              </button>
            </form>

            <div className="mt-5 text-xs text-slate-300">
              By logging in, you agree to keep your account secure.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}