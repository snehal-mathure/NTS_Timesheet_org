import React, { useState } from "react";
import { loginUser } from "../services/authservice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await loginUser(email, password);
      setMessage("✅ Login successful!");

      console.log("User logged in:", data);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (error) {
      setMessage(error.message || "❌ Invalid credentials");
    }

    setLoading(false);

    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-800 
      p-4 sm:p-6 md:p-10">

      <div className="
        w-full max-w-sm sm:max-w-md md:max-w-lg 
        bg-white rounded-2xl p-6 sm:p-8 
        border border-gray-200
        shadow-[0_10px_40px_rgba(0,0,0,0.1)]
        hover:shadow-[0_15px_45px_rgba(0,0,0,0.16)]
        transition-all duration-300
      ">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 drop-shadow-sm">
          NTS Timesheet Login
        </h2>

        {message && (
          <div
            className={`mb-4 flex items-center justify-between px-4 py-3 rounded-lg border shadow-sm
            ${message.includes("✅")
              ? "bg-green-100 border-green-300 text-green-700"
              : "bg-red-100 border-red-300 text-red-700"
            }
          `}>
            <span className="text-sm sm:text-base">{message}</span>
            <button onClick={() => setMessage("")} className="font-bold">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full border border-gray-300 rounded-lg px-3 py-2 
                text-sm sm:text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
                shadow-inner
              "
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full border border-gray-300 rounded-lg px-3 py-2 
                text-sm sm:text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
                shadow-inner
              "
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full text-white font-semibold py-2 rounded-lg 
              text-sm sm:text-base
              transition duration-300 shadow-lg
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
              }
            `}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Links */}
        <div className="text-center mt-6 space-y-1">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </a>
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 font-medium hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
