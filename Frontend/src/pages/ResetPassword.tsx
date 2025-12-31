import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import api from "../api/axios";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email") || "";
  const code = params.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";
  const CardBase =
    "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";

  if (!email || !code) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-md">
          <div className="rounded-3xl border border-rose-400/20 bg-white/[0.06] p-6 text-center shadow-[0_18px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">Invalid password reset link</div>
            <div className="mt-1 text-sm text-rose-200">
              Missing email or code. Please request a new reset link.
            </div>
            <div className="mt-4">
              <Link
                to="/forgot"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_45px_-30px_rgba(99,102,241,0.85)] hover:-translate-y-[1px] transition focus:outline-none focus:ring-4 focus:ring-indigo-300/30"
              >
                Go to forgot password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg(null);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post("/api/Auth/reset-password", {
        Email: email,
        Code: code,
        NewPassword: password,
      });
      setMsg(resp.data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Reset password</h1>
            <p className="mt-1 text-sm text-slate-300">
              Choose a new password for <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          <div className={CardBase}>
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500" />

            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  <div className="font-semibold text-white">Reset failed</div>
                  <div className="mt-1">{error}</div>
                </div>
              )}
              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  <div className="font-semibold text-white">Success</div>
                  <div className="mt-1">{msg}</div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">New password</span>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={InputBase + " pl-9 pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Confirm password</span>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={InputBase + " pl-9 pr-11"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <button
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
                  <span className="relative">{loading ? "Resetting..." : "Reset Password"}</span>
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
              </form>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-300">
            If you didn’t request this, you can ignore this page.
          </div>
        </div>
      </div>
    </div>
  );
}