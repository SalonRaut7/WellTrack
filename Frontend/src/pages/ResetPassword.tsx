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

  if (!email || !code) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Invalid password reset link</div>
          <div className="mt-1 text-sm text-rose-700">
            Missing email or code. Please request a new reset link.
          </div>
          <div className="mt-4">
            <Link
              to="/forgot"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Go to forgot password
            </Link>
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

  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Reset password
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a new password for <span className="font-semibold">{email}</span>
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500" />

            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <div className="font-semibold">Reset failed</div>
                  <div className="mt-1 text-rose-700">{error}</div>
                </div>
              )}
              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div className="font-semibold">Success</div>
                  <div className="mt-1 text-emerald-700">{msg}</div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">New password</span>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Confirm password</span>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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
                    loading
                      ? "bg-slate-300 text-white cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                  ].join(" ")}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-500" />
                  Back to login
                </button>
              </form>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            If you didn’t request this, you can ignore this page.
          </div>
        </div>
      </div>
    </div>
  );
}