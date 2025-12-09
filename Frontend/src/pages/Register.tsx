import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
        // navigate to verify page with userId & email for display (verify endpoint needs userId)
        navigate(`/verify-otp?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`);
      } else {
        setError("Registration failed, server returned no userId.");
      }
    } catch (err: any) {
      // axios style errors
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-3">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>
        )}
        {msg && (
          <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-center">{msg}</div>
        )}

        <form onSubmit={submitRegister} className="space-y-4" autoComplete="off">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name"
                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />

          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />

          <div className="relative">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                   type={showPassword ? "text" : "password"}
                   className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-400" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-600">{showPassword ? <EyeOff /> : <Eye />}</button>
          </div>

          {password && (
            <div className="text-sm text-center">
              Strength: {evaluateStrength(password)}
            </div>
          )}

          <div className="relative">
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                   placeholder="Confirm Password" type={showConfirmPassword ? "text" : "password"}
                   className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-400" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2 text-gray-600">{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
          </div>

          <button type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white rounded-lg font-medium ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            Register
          </button>

          <p onClick={() => navigate("/login")}
             className="text-center text-sm text-blue-600 hover:underline cursor-pointer">Already have an account? Log in</p>
        </form>
      </div>
    </div>
  );
}
