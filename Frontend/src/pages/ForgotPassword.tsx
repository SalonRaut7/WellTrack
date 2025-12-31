import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post("/api/Auth/forgot-password", { Email: email });

      if (resp.status === 200) {
        setMsg(resp.data?.message || "OTP sent if the email exists.");
        localStorage.setItem("resetEmail", email);
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&mode=reset`);
      }
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.message || "Request failed.";
      setError(String(backendMsg));
    } finally {
      setLoading(false);
    }
  };

  // Dark/glass UI to match Dashboard theme
  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const CardBase =
    "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Forgot password</h1>
            <p className="mt-1 text-sm text-slate-300">
              Enter your email and we’ll send you a one-time code.
            </p>
          </div>

          <div className={CardBase}>
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500" />

            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  <div className="font-semibold text-white">Request failed</div>
                  <div className="mt-1">{error}</div>
                </div>
              )}

              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  <div className="font-semibold text-white">Success</div>
                  <div className="mt-1">{msg}</div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4" autoComplete="off">
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Email</span>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className={InputBase + " pl-9"}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    ButtonBase,
                    "relative overflow-hidden text-white",
                    loading
                      ? "bg-white/10 text-slate-400 cursor-not-allowed border border-white/10"
                      : "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)] hover:-translate-y-[1px]",
                  ].join(" ")}
                >
                  {!loading && (
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100 bg-[radial-gradient(500px_circle_at_20%_0%,rgba(255,255,255,0.18),transparent_40%)]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">{loading ? "Sending..." : "Send OTP"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={[
                    "inline-flex w-full items-center justify-center gap-2 rounded-2xl",
                    "border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100",
                    "shadow-sm transition hover:bg-white/15 hover:-translate-y-[1px]",
                    "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                  ].join(" ")}
                >
                  <ArrowLeft className="h-4 w-4 text-slate-200" />
                  Back to login
                </button>

                <div className="text-center text-xs text-slate-300">
                  Don’t have an account?{" "}
                  <Link to="/register" className="font-semibold text-emerald-200 hover:text-white hover:underline">
                    Register
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-300">
            If the email exists, an OTP will be sent.
          </div>
        </div>
      </div>
    </div>
  );
}