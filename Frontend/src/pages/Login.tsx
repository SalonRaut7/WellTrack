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
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Header card */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative p-6 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 opacity-15" />
              <div className="relative flex items-start gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 text-white font-extrabold shadow-sm">
                    W
                  </div>
                  <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 opacity-20 blur" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Log in to WellTrack — your personal wellness companion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <div className="font-semibold">Login failed</div>
                <div className="mt-1 text-rose-700">{error}</div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" autoComplete="off">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Email</span>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                <span className="text-xs font-medium text-slate-600">Password</span>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    tabIndex={-1}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <Link to="/forgot" className="font-semibold text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
                <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
                  Create account
                </Link>
              </div>

              <button
                type="submit"
                className={ButtonBase + " bg-slate-900 text-white hover:bg-slate-800"}
              >
                Login
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
