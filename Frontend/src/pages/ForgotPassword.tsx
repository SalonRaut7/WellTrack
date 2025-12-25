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
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we’ll send you a one-time code.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500" />

            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <div className="font-semibold">Request failed</div>
                  <div className="mt-1 text-rose-700">{error}</div>
                </div>
              )}

              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div className="font-semibold">Success</div>
                  <div className="mt-1 text-emerald-700">{msg}</div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4" autoComplete="off">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Email</span>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    loading
                      ? "bg-slate-300 text-white cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                  ].join(" ")}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-500" />
                  Back to login
                </button>

                <div className="text-center text-xs text-slate-500">
                  Don’t have an account?{" "}
                  <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
                    Register
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            If the email exists, an OTP will be sent.
          </div>
        </div>
      </div>
    </div>
  );
}
