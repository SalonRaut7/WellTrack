import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
        // Verify registration email
        await api.post(
          `/api/Auth/verify-email?userId=${encodeURIComponent(userId)}&code=${encodeURIComponent(otp)}`
        );
        setMsg("Email verified!");
        localStorage.removeItem("pendingUserId");
        localStorage.removeItem("pendingUserEmail");
        setTimeout(() => navigate("/login"), 900);
      } else if (mode === "reset") {
        // Verify password reset OTP
        await api.post(
          `/api/Auth/verify-reset-otp?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otp)}`
        );
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
        await api.post(
          "/api/Auth/resend-otp",
          JSON.stringify(localStorage.getItem("pendingUserEmail") || email),
          { headers: { "Content-Type": "application/json" } }
        );
        setMsg("OTP resent successfully.");
      } else if (mode === "reset") {
        await api.post(
          "/api/Auth/resend-reset-otp",
          JSON.stringify(email),
          { headers: { "Content-Type": "application/json" } }
        );
        setMsg("Password reset OTP resent successfully.");
      }
      setResendTimer(30);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-3">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "register" ? "Verify Email" : "Verify OTP"}
        </h2>
        {email && (
          <p className="text-sm text-gray-600 text-center mb-3">
            Code sent to <strong>{email}</strong>
          </p>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        )}
        {msg && (
          <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded text-center">
            {msg}
          </div>
        )}

        <form onSubmit={submitOtp} className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full p-3 border rounded-lg text-center focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            disabled={resendTimer > 0 || loading}
            onClick={resendOtp}
            className={`w-full py-3 rounded-lg text-white ${
              resendTimer > 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>

          <p
            onClick={() => navigate("/login")}
            className="text-center text-sm text-gray-600 hover:underline cursor-pointer"
          >
            Back to login
          </p>
        </form>
      </div>
    </div>
  );
}
