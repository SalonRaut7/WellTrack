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
        navigate(`/verify-otp?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`);
      } else {
        setError("Registration failed, server returned no userId.");
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      let formattedError = "Registration failed.";
      if (apiError?.errors) {
        if (Array.isArray(apiError.errors)) formattedError = apiError.errors.join(" | ");
        else if (typeof apiError.errors === "object") formattedError = Object.values(apiError.errors).flat().join(" | ");
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
    "w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white shadow-sm outline-none placeholder:text-slate-300 focus:border-white/15 focus:ring-4 focus:ring-indigo-300/30";
  const ButtonBase =
    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-300/30";

  const CardBase =
    "rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl";

  const strength = password ? evaluateStrength(password) : null;

  const strengthMeta =
    strength === "Strong"
      ? { chip: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100", bar: "bg-emerald-500 w-full" }
      : strength === "Medium"
        ? { chip: "border-amber-400/20 bg-amber-500/10 text-amber-100", bar: "bg-amber-500 w-2/3" }
        : { chip: "border-rose-400/20 bg-rose-500/10 text-rose-100", bar: "bg-rose-500 w-1/3" };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-sky-500/15 to-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Header card */}
          <div className={"mb-6 overflow-hidden " + CardBase}>
            <div className="relative p-6 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(236,72,153,0.16),transparent_55%),radial-gradient(800px_circle_at_85%_120%,rgba(244,63,94,0.14),transparent_50%)]" />
              <div className="relative">
                <h2 className="text-2xl font-extrabold tracking-tight text-white">Create account</h2>
                <p className="mt-1 text-sm text-slate-300">Join WellTrack and start tracking your wellness.</p>
              </div>
            </div>
          </div>

          <div className={CardBase + " p-5 sm:p-6"}>
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <div className="font-semibold text-white">Registration failed</div>
                <div className="mt-1">{error}</div>
              </div>
            )}
            {msg && (
              <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                <div className="font-semibold text-white">Success</div>
                <div className="mt-1">{msg}</div>
              </div>
            )}

            <form onSubmit={submitRegister} className="space-y-4" autoComplete="off">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Full name</span>
                <div className="relative mt-1">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={InputBase + " pl-9"} />
                </div>
              </label>

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

              <label className="block">
                <span className="text-xs font-medium text-slate-300">Password</span>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {password && (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-300">Password strength</div>
                    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", strengthMeta.chip].join(" ")}>
                      {strength}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className={["h-2 rounded-full", strengthMeta.bar].join(" ")} />
                  </div>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-medium text-slate-300">Confirm password</span>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
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
                <span className="relative">{loading ? "Registering..." : "Register"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className={[
                  "w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100",
                  "shadow-sm transition hover:bg-white/15 hover:-translate-y-[1px]",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-300/30",
                ].join(" ")}
              >
                Already have an account? Log in
              </button>
            </form>

            <div className="mt-5 text-xs text-slate-300">
              Tip: Use a unique password you don’t reuse elsewhere.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}