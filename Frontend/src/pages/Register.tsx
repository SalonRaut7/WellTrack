import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, User as UserIcon, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // messages
  const [error, setError] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // password strength
  const evaluateStrength = (pwd: string) => {
    if (pwd.length < 6) return "Weak";
    if (/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(pwd)) return "Strong";
    return "Medium";
  };

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("one number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) errors.push("one special character");
    return errors;
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg(null);
    setLoading(true);

    if (!name.trim()) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setError("Password must contain " + pwdErrors.join(", ") + ".");
      setLoading(false);
      return;
    }

    try {
      const userId = await register(name, email, password);
      if (userId) {
        setMsg("Registered successfully! Check your email for OTP.");
        navigate(
          `/verify-otp?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`
        );
      } else {
        setError("Registration failed, server returned no userId.");
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      let formattedError = "Registration failed.";
      if (apiError?.errors) {
        if (Array.isArray(apiError.errors)) formattedError = apiError.errors.join(" | ");
        else if (typeof apiError.errors === "object")
          formattedError = Object.values(apiError.errors).flat().join(" | ");
      } else if (apiError?.message) {
        formattedError = apiError.message;
      } else if (err?.message) {
        formattedError = err.message;
      }
      setError(formattedError);
      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  const InputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-100";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-100";

  const strength = password ? evaluateStrength(password) : null;
  const strengthMeta =
    strength === "Strong"
      ? { chip: "border-emerald-200 bg-emerald-50 text-emerald-700", bar: "bg-emerald-500 w-full" }
      : strength === "Medium"
        ? { chip: "border-amber-200 bg-amber-50 text-amber-800", bar: "bg-amber-500 w-2/3" }
        : { chip: "border-rose-200 bg-rose-50 text-rose-700", bar: "bg-rose-500 w-1/3" };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Header card */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative p-6 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-500 opacity-15" />
              <div className="relative">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Create account
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Join WellTrack and start tracking your wellness.
                </p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <div className="font-semibold">Registration failed</div>
                <div className="mt-1 text-rose-700">{error}</div>
              </div>
            )}
            {msg && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="font-semibold">Success</div>
                <div className="mt-1 text-emerald-700">{msg}</div>
              </div>
            )}

            <form onSubmit={submitRegister} className="space-y-4" autoComplete="off">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Full name</span>
                <div className="relative mt-1">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className={InputBase + " pl-9"}
                  />
                </div>
              </label>

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

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Password</span>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    type={showPassword ? "text" : "password"}
                    className={InputBase + " pl-9 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {password && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-600">Password strength</div>
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                        strengthMeta.chip,
                      ].join(" ")}
                    >
                      {strength}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                    <div className={["h-2 rounded-full", strengthMeta.bar].join(" ")} />
                  </div>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Confirm password</span>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={InputBase + " pl-9 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={[
                  ButtonBase,
                  loading ? "bg-slate-300 text-white cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800",
                ].join(" ")}
              >
                {loading ? "Registering..." : "Register"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Already have an account? Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}