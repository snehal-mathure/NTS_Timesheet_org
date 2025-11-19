// src/components/AddClient.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addClient } from "../services/AdminDashboard/clientservice";
import Alert from "./Alert";

export default function AddClient() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    client_name: "",
    start_date: "",
    end_date: "",
    daily_hours: "",
  });

  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function validate() {
    if (!form.client_name.trim()) return "Client name is required.";
    if (!form.start_date) return "Start date is required.";

    const hours = parseFloat(form.daily_hours);
    if (isNaN(hours) || hours < 0 || hours > 24)
      return "Daily hours must be between 0–24.";

    if (form.end_date && form.end_date < form.start_date)
      return "End date cannot be earlier than start date.";

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const error = validate();
    if (error) return setFlash({ type: "error", message: error });

    setLoading(true);
    setFlash(null);

    try {
      await addClient({
        client_name: form.client_name.trim(),
        start_date: form.start_date,
        end_date: form.end_date || null,
        daily_hours: parseFloat(form.daily_hours),
      });

      setFlash({ type: "success", message: "Client added successfully!" });

      setTimeout(() => navigate("/clients"), 800);
    } catch (err) {
      setFlash({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
        <Link
          to="/dashboard"
          className="block mb-4 text-sm text-gray-600 hover:text-blue-600"
        >
          ← Back to Dashboard
        </Link>

        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
          Add New Client
        </h2>

        {flash && (
          <div className="mb-4">
            <Alert
              type={flash.type}
              message={flash.message}
              onClose={() => setFlash(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CLIENT NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* START DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* DAILY HOURS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="daily_hours"
              value={form.daily_hours}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Link
              to="/clients"
              className="w-full sm:w-auto text-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
            >
              View All Clients
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
