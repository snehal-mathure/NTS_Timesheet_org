import React, { useState } from "react";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { forgotPasswordRequest } from "../services/authservice";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [empid, setEmpid] = useState("");
  const [email, setEmail] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (new_password !== confirm_password) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    try {
      await forgotPasswordRequest({
        empid,
        email,
        new_password,
        confirm_password,
      });

      setMessage("✔ Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.message || "❌ Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6edff] via-white to-[#e8e0ff] p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        <h1 className="text-[32px] font-semibold text-center mb-6 text-gray-900">
          Forgot Password
        </h1>

        {message && (
          <div
            className={`mb-4 px-3 py-2 rounded-lg border text-sm font-medium shadow-sm ${
              message.includes("✔")
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-red-100 border-red-300 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Employee ID */}
          <FieldInput
            label="Employee ID *"
            icon={<FiUser className="text-gray-500" />}
            value={empid}
            onChange={(e) => setEmpid(e.target.value)}
          />

          {/* Email */}
          <FieldInput
            label="Email *"
            type="email"
            icon={<FiMail className="text-gray-500" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* New Password */}
          <PasswordInput
            label="New Password *"
            value={new_password}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNewPass}
            setShow={setShowNewPass}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password *"
            value={confirm_password}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirmPass}
            setShow={setShowConfirmPass}
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-[#4c6fff] to-[#1532c7]
            text-white py-2 rounded-lg text-sm font-medium shadow-md hover:opacity-95 transition"
          >
            Reset Password
          </button>
        </form>

        <p className="text-center text-xs mt-4 text-gray-600">
          Remember your password?{" "}
          <a href="/" className="text-blue-600 font-medium hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}

// ✔ Re-usable input component with icon
function FieldInput({ label, type = "text", icon, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 shadow-sm">
        {icon}
        <input
          type={type}
          required
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

// ✔ Only 1 toggle eye button
// ✔ Browser icon hidden
// ✔ Styled same as Login
function PasswordInput({ label, value, onChange, show, setShow }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 shadow-sm">
        <FiLock className="text-gray-500" />

        <input
          type={show ? "text" : "password"}
          required
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          style={{ WebkitTextSecurity: show ? "none" : "disc" }}
        />

        <button type="button" onClick={() => setShow(!show)}>
          {show ? <FiEyeOff /> : <FiEye />}
        </button>

        {/* 👉 Hide browser default password icon */}
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
  );
}
