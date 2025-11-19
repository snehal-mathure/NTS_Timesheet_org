import React, { useState } from "react";
import { registerUser } from "../services/authservice";

export default function Register() {
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
        dept_id: "",
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl border">

        <h1 className="text-3xl font-bold text-center mb-6">
          Employee Registration
        </h1>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-center font-medium 
              ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputBox label="Employee ID" name="empid" value={formData.empid} onChange={handleChange} />

          <InputBox label="First Name" name="fname" value={formData.fname} onChange={handleChange} />

          <InputBox label="Last Name" name="lname" value={formData.lname} onChange={handleChange} />

          <InputBox label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />

          {/* Department ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="dept_id"
              value={formData.dept_id}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Department</option>
              <option value="1">Digital Automation</option>
              <option value="2">App Dev</option>
              <option value="3">Product</option>
              <option value="4">IT Support</option>
              <option value="5">HR and Admin</option>
              <option value="6">DevOps</option>
              <option value="7">QA</option>
              <option value="8">Salesforce Enterprise</option>
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
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

function InputBox({ label, type = "text", name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        required
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
