// src/pages/Login.jsx
import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser } from "../services/authservice";
import { useNavigate, NavLink } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await loginUser(email, password);
      const { user } = res;

      setMessage("✅ Login successful!");

      const role = user.role?.toLowerCase() || "employee";

      // update sidebar
      window.dispatchEvent(new Event("td_sidebar_change"));

      let redirect = "/userdashboard";
      if (role === "admin") redirect = "/dashboard";
      else if (role === "approver") redirect = "/approvetimesheets";

      setTimeout(() => navigate(redirect), 600);
    } catch (err) {
      setMessage(err.message || "❌ Invalid credentials");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6edff] via-white to-[#e8e0ff] p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        <h1 className="text-[32px] font-semibold text-center text-gray-900 tracking-tight mb-5">
          Login
        </h1>

        {/* ✅ LOGIN / SIGNUP TABS (AUTO ACTIVE) */}
        <div className="flex text-sm mb-5 rounded-xl overflow-hidden border border-gray-200">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 py-2 text-center font-semibold transition
              ${
                isActive
                  ? "text-white bg-gradient-to-r from-[#4c6fff] to-[#1532c7]"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`
            }
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              `flex-1 py-2 text-center font-semibold transition
              ${
                isActive
                  ? "text-white bg-gradient-to-r from-[#4c6fff] to-[#1532c7]"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`
            }
          >
            Signup
          </NavLink>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-3 px-3 py-2 rounded-lg border text-sm shadow-sm font-medium
            ${
              message.includes("✅")
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-red-100 border-red-300 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">

          {/* Email */}
          <div className="w-4/5">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm bg-gray-50">
              <FiMail className="text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-transparent outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="w-4/5">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm bg-gray-50">
              <FiLock className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
                autoComplete="new-password"
                style={{ WebkitTextSecurity: showPassword ? "none" : "disc" }}
              />

              <button
                type="button"
                className="text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>

              {/* hide browser eye */}
              <style>
                {`
                  input::-ms-reveal,
                  input::-ms-clear {
                    display: none !important;
                  }
                  input::-webkit-textfield-decoration-container {
                    display: none !important;
                  }
                `}
              </style>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="w-4/5 text-right -mt-2">
            <button
              className="text-xs text-blue-600 hover:underline"
              type="button"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-4/5 bg-gradient-to-r from-[#4c6fff] to-[#1532c7] text-white py-2.5 rounded-lg text-sm font-medium shadow-md hover:opacity-95 transition disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-5">
          Don’t have an account?{" "}
          <NavLink to="/register" className="text-blue-600 font-medium hover:underline">
            Signup now
          </NavLink>
        </p>
      </div>
    </div>
  );
}

