import React, { useState } from "react";
import { registerUser } from "../services/authservice";

export default function Register() {
  const [formData, setFormData] = useState({
    empid: "",
    fname: "",
    lname: "",
    email: "",
    dept: "",
    password: "",
    confirm_password: "",
    approver_id: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setMessage("❌ Passwords do not match!");
      setSuccess(false);
      return;
    }

    try {
      const res = await registerUser(formData);

      setMessage(res.message || "Registration successful!");
      setSuccess(true);

      setFormData({
        empid: "",
        fname: "",
        lname: "",
        email: "",
        dept: "",
        password: "",
        confirm_password: "",
        approver_id: "",
      });
    } catch (err) {
      setMessage(err.message || "❌ Registration failed!");
      setSuccess(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 px-4 py-6">
      <div className="bg-white shadow-2xl shadow-blue-100 rounded-2xl p-8 w-full max-w-xl 
                      border border-gray-200 transition-all duration-300 hover:shadow-[0_8px_35px_rgba(0,0,0,0.15)]">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Employee Registration
        </h1>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-center font-medium transition-all duration-200 
            ${
              success
                ? "bg-green-100 text-green-700 border border-green-300 shadow-sm"
                : "bg-red-100 text-red-700 border border-red-300 shadow-sm"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputBox label="Employee ID" name="empid" value={formData.empid} onChange={handleChange} />

          <InputBox label="First Name" name="fname" value={formData.fname} onChange={handleChange} />

          <InputBox label="Last Name" name="lname" value={formData.lname} onChange={handleChange} />

          <InputBox label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Department</label>
            <select
              name="dept"
              value={formData.dept}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 bg-white shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              <option value="Digital Automation">Digital Automation</option>
              <option value="App Dev">App Dev</option>
              <option value="Product">Product</option>
              <option value="IT Support">IT Support</option>
              <option value="HR and Admin">HR and Admin</option>
              <option value="DevOps">DevOps</option>
              <option value="QA">QA</option>
              <option value="Salesforce Enterprise">Salesforce Enterprise</option>
            </select>
          </div>

          <InputBox label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />

          <InputBox
            label="Confirm Password"
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
          />

          <InputBox label="Approver ID" name="approver_id" value={formData.approver_id} onChange={handleChange} />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg 
                       hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-md"
          >
            Register
          </button>

          <p className="text-center text-sm mt-4 text-gray-600">
            Already have an account?{" "}
            <a href="/" className="text-blue-600 font-semibold hover:underline">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

function InputBox({ label, type = "text", name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        required
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2 bg-white shadow-sm 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
