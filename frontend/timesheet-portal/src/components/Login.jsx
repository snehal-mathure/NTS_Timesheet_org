import React, { useState } from "react";
import { loginUser } from "../services/authService"; // ✅ import backend call

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password); // call backend

      setMessage("✅ Login successful!");
      console.log("User logged in:", data);

      // you can redirect or save token here
      // localStorage.setItem("token", data.token);

    } catch (error) {
      setMessage(error.message || "Invalid credentials");
    }

    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-800 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          NTS Timesheet Login
        </h2>

        {message && (
          <div className="mb-4 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="font-bold">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-6 space-y-1">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </a>
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
