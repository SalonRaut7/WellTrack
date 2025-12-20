import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-3">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        {error && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-center">{error}</div>}
        {msg && <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded text-center">{msg}</div>}

        <form onSubmit={submit} className="space-y-4" autoComplete="off">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
