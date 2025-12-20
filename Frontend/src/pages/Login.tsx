import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const currentUser = JSON.parse(localStorage.getItem("userRoles") || "[]");
      const roles = currentUser as string[];
      if (roles.includes("Admin")) {
        navigate("/admin");
        return;
      } else{
        navigate("/dashboard");
      }
    } catch (err: any) {
      let msg = "Invalid credentials";
      if (err?.response) {
        msg = err.response.data?.message || (err.response.status === 401 ? "Invalid credentials" : err.message);
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      setPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold text-xl mb-2">W</div>
          <h2 className="text-xl font-semibold text-gray-700 text-center">WellTrack — Your Personal Wellness Companion</h2>
        </div>

        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">{error}</div>}

        <form onSubmit={submit} className="space-y-4" autoComplete="off">
          <input name="username" autoComplete="username"
                 type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                 className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />

          <div className="relative">
            <input name="password" autoComplete="current-password"
                   type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="Password" className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-400" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-2 text-gray-500" tabIndex={-1}>
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <Link to="/forgot" className="text-blue-600 hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-green-600 hover:underline">Register</Link>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Login</button>
        </form>
      </div>
    </div>
  );
}
