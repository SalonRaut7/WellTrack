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
            navigate(
              `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otp)}`
            ),
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
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base tracking-[0.35em] text-center text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {mode === "register" ? "Verify email" : "Verify OTP"}
            </h1>
            {email && (
              <p className="mt-1 text-sm text-slate-500">
                Enter the code sent to <span className="font-semibold text-slate-700">{email}</span>
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500" />

            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <div className="font-semibold">Verification failed</div>
                  <div className="mt-1 text-rose-700">{error}</div>
                </div>
              )}
              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div className="font-semibold">Success</div>
                  <div className="mt-1 text-emerald-700">{msg}</div>
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
                    loading
                      ? "bg-slate-300 text-white cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                  ].join(" ")}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={resendOtp}
                  className={[
                    ButtonBase,
                    resendTimer > 0 || loading
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700",
                  ].join(" ")}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
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
            Didn’t get a code? You can resend once the timer finishes.
          </div>
        </div>
      </div>
    </div>
  );
}