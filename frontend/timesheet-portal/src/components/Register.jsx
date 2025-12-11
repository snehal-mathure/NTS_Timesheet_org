import { registerUser } from "../services/authservice";
import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { getDepartments } from "../services/authservice";

export default function Register() {
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    empid: "",
    fname: "",
    lname: "",
    email: "",
    dept_id: "",
    password: "",
    confirm_password: "",
    approver_id: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDepartments().then((data) => setDepartments(data));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setMessage("❌ Passwords do not match!");
      setSuccess(false);
      return;
    }

    try {
      await registerUser(formData);
      setMessage("🎉 Registration successful!");
      setSuccess(true);
    } catch (err) {
      const backendMsg = err.message || "";

      if (backendMsg.includes("Employee ID")) {
        setMessage("❌ Employee ID already registered!");
      } else if (backendMsg.includes("Email")) {
        setMessage("❌ Email already exists!");
      } else {
        setMessage("❌ Registration failed! Please try again.");
      }
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6edff] via-white to-[#e8e0ff] p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        <h1 className="text-[32px] font-semibold text-center text-gray-900 tracking-tight mb-6">
          Signup
        </h1>

        <div className="flex text-sm mb-6 rounded-xl overflow-hidden border border-gray-200">
          <a
            href="/"
            className="flex-1 py-2 text-center font-semibold text-white
            bg-gradient-to-r from-[#4c6fff] to-[#1532c7]"
          >
            Login
          </a>
          <button className="flex-1 py-2 font-semibold text-gray-700 bg-gray-100 cursor-default">
            Signup
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 px-3 py-2 rounded-lg border text-sm font-medium shadow-sm ${
              success
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-red-100 border-red-300 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

          <InputBox label="Employee ID" name="empid" value={formData.empid} onChange={handleChange} />
          <InputBox label="Approver ID" name="approver_id" value={formData.approver_id} onChange={handleChange} required={false} />

          <InputBox label="First Name" name="fname" value={formData.fname} onChange={handleChange} />
          <InputBox label="Last Name" name="lname" value={formData.lname} onChange={handleChange} />

          <InputBox label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />

          <div>
            <label className="text-[13px] text-gray-700 font-medium mb-1 block">Department *</label>
            <select
              required
              name="dept_id"
              value={formData.dept_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm shadow-sm outline-none"
            >
              <option value="">Select</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </div>

          <PasswordField
            label="Password *"
            name="password"
            show={showPassword}
            setShow={setShowPassword}
            value={formData.password}
            onChange={handleChange}
          />

          <PasswordField
            label="Confirm *"
            name="confirm_password"
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
            value={formData.confirm_password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="col-span-2 bg-gradient-to-r from-[#4c6fff] to-[#1532c7]
            text-white py-2 mt-2 rounded-lg text-sm font-medium shadow-md hover:opacity-95 transition"
          >
            Signup
          </button>

        </form>

        <p className="text-center text-xs mt-5 text-gray-600">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 font-medium hover:underline">Login</a>
        </p>

      </div>
    </div>
  );
}

function InputBox({ label, type = "text", name, value, onChange, required = true }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-gray-700 mb-1 block">{label}</label>
      <input
        type={type}
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm shadow-sm outline-none"
      />
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, setShow }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-gray-700 mb-1 block">{label}</label>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 shadow-sm">

        <input
          type={show ? "text" : "password"}
          required
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent outline-none"
          autoComplete="new-password"
          style={{ WebkitTextSecurity: show ? "none" : "disc" }}
        />

        <button type="button" onClick={() => setShow(!show)} className="text-gray-600">
          {show ? <FiEyeOff /> : <FiEye />}
        </button>

        {/* Hides default browser password reveal icon */}
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
