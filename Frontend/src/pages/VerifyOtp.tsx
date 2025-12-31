import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, ArrowLeft } from "lucide-react";
import api from "../api/axios";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("userId") || "";
  const email = searchParams.get("email") || "";
  const mode = searchParams.get("mode") || "register"; // "register" | "reset"

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = window.setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg(null);

    if (!otp || otp.trim().length < 4) {
      setError("Enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await api.post(
          `/api/Auth/verify-email?userId=${encodeURIComponent(userId)}&code=${encodeURIComponent(otp)}`
        );
        setMsg("Email verified!");
        localStorage.removeItem("pendingUserId");
        localStorage.removeItem("pendingUserEmail");
        setTimeout(() => navigate("/login"), 900);
      } else if (mode === "reset") {
        await api.post("/api/Auth/verify-reset-otp", { Email: email, Code: otp });
        setMsg("OTP verified. You can now reset password.");
        setTimeout(
          () =>
            navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otp)}`),
          900
        );
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "register") {
        await api.post("/api/Auth/resend-otp", {
          Email: localStorage.getItem("pendingUserEmail") || email,
        });
        setMsg("OTP resent successfully.");
      } else if (mode === "reset") {
        await api.post("/api/Auth/resend-reset-otp", { Email: email });
        setMsg("Password reset OTP resent successfully.");
      }
      setResendTimer(30);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const InputBase =
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-base tracking-[0.35em] text-center text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {mode === "register" ? "Verify email" : "Verify OTP"}
            </h1>
            {email && (
              <p className="mt-1 text-sm text-slate-300">
                Enter the code sent to <span className="font-semibold text-white">{email}</span>
              </p>
            )}
          </div>

          <div className={CardBase}>
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500" />

            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  <div className="font-semibold text-white">Verification failed</div>
                  <div className="mt-1">{error}</div>
                </div>
              )}
              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  <div className="font-semibold text-white">Success</div>
                  <div className="mt-1">{msg}</div>
                </div>
              )}

              <form onSubmit={submitOtp} className="space-y-4">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="______"
                  maxLength={6}
                  className={InputBase}
                />

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
                  <span className="relative">{loading ? "Verifying..." : "Verify"}</span>
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={resendOtp}
                  className={[
                    ButtonBase,
                    "relative overflow-hidden",
                    resendTimer > 0 || loading
                      ? "bg-white/10 text-slate-400 cursor-not-allowed border border-white/10"
                      : "text-white bg-gradient-to-r from-emerald-600 to-lime-500 shadow-[0_16px_45px_-30px_rgba(16,185,129,0.6)] hover:-translate-y-[1px]",
                  ].join(" ")}
                >
                  <span className="relative">
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </span>
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
            Didn’t get a code? You can resend once the timer finishes.
          </div>
        </div>
      </div>
    </div>
  );
}