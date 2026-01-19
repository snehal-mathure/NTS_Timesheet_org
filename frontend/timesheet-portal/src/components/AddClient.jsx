// src/pages/AddClient.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import { addClient } from "../services/AdminDashboard/clientservice";
import { FiCheckCircle, FiX } from "react-icons/fi";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

/* ---------------- Toast Component ---------------- */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-white border-l-4 shadow-lg rounded-xl p-4 max-w-sm flex gap-3
        ${type === "success" ? "border-emerald-500" : "border-rose-500"}`}
    >
      {type === "success" ? (
        <FiCheckCircle className="text-emerald-500 mt-1" />
      ) : (
        <FiX className="text-rose-500 mt-1" />
      )}

      <div className="flex-1">
        <p className="text-sm font-semibold">
          {type === "success" ? "Success" : "Error"}
        </p>
        <p className="text-xs text-slate-600">{message}</p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

export default function AddClient() {
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  /* ---------------- Sidebar Sync ---------------- */
  useEffect(() => {
    const handler = () =>
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");

    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  /* ---------------- Auto Hide Toast ---------------- */
  useEffect(() => {
    if (showSuccess || showError) {
      const t = setTimeout(() => {
        setShowSuccess("");
        setShowError("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [showSuccess, showError]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSuccess("");
    setShowError("");

    const payload = {
      client_name: clientName,
      start_date: startDate,
      end_date: endDate || null,
      daily_hours: dailyHours,
    };

    try {
      setSubmitting(true);
      const response = await addClient(payload);

      if (response && response.success) {
        setShowSuccess("Client added successfully!");
        setClientName("");
        setStartDate("");
        setEndDate("");
        setDailyHours("");
      } else {
        setShowError(response?.message || "Failed to add client");
      }
    } catch (err) {
      console.error(err);
      setShowError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const accent = "#4C6FFF";
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  return (
    <div className="min-h-screen flex bg-[#F5F7FF]">
      {/* SIDEBAR */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72">
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main
        className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6 md:py-8`}
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <PageHeader
            section="Clients"
            title="Add New Client"
            description="Create a new client and configure their project settings."
          />

          <div className="bg-white rounded-3xl shadow border border-[#e5e7f5] overflow-hidden">
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full rounded-2xl border px-3 py-2.5 text-sm"
                    placeholder="e.g., Acme Corp"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="rounded-2xl border px-3 py-2.5 text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-2xl border px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Link
                    to="/viewclient"
                    className="px-4 py-2 rounded-2xl border text-xs"
                  >
                    View Clients
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-2xl text-white text-sm font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
                    }}
                  >
                    {submitting ? "Saving..." : "Add Client"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* TOAST CONTAINER */}
      <div className="fixed top-5 right-5 z-50 space-y-3">
        {showSuccess && (
          <Toast
            type="success"
            message={showSuccess}
            onClose={() => setShowSuccess("")}
          />
        )}
        {showError && (
          <Toast
            type="error"
            message={showError}
            onClose={() => setShowError("")}
          />
        )}
      </div>
    </div>
  );
}
