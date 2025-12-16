import React, { useEffect, useState, useCallback } from "react";
import {
  fetchTimesheetDefaulters,
  downloadCSVDefaulters,
} from "../../services/AdminDashboard/TimesheetDefaultersService";
import axiosInstance from "../../services/AdminDashboard/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import PageHeader from "../PageHeader";
import TimesheetSidebar from "./timesheetSidebar";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

/* ✅ function, NOT object */
const getInitialFilters = () => ({
  start_date: "",
  end_date: "",
  department: "",
  status: "",
});

export default function TimesheetDefaulters() {
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(getInitialFilters());

  const navigate = useNavigate();

  /* Sidebar collapse */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

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

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/logout", { withCredentials: true });
      if (res.data.status === "success") {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* DATA LOAD (unchanged logic) */
  const loadData = useCallback(async () => {
    try {
      const res = await fetchTimesheetDefaulters(filters);
      if (!res?.error) {
        setDepartments(res.data?.departments || []);
        setData(res.data?.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* RESET (unchanged logic) */
  const handleReset = () => {
    setFilters(getInitialFilters());
  };

  /* EXPORT */
  const handleExport = () => {
    downloadCSVDefaulters(filters);
  };

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <TimesheetSidebar onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Timesheet Defaulters" subtitle="Timesheet Reports" />

        {/* MAIN CARD */}
        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* CARD HEADER */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-[#4C6FFF]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Timesheet Defaulters
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Employees with missing or pending timesheet entries.
              </p>
            </div>
          </div>

          {/* CARD BODY */}
          <div className="px-6 py-6 md:py-7 space-y-6">

            {/* FILTER CARD */}
          <div className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-5 relative">

            {/* RESET + EXPORT */}
            <div className="absolute right-4 top-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>

              <div className="relative group overflow-visible">
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-emerald-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                </button>

                <div className="absolute -top-9 right-0 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md shadow transition whitespace-nowrap">
                  Export CSV
                </div>
              </div>
            </div>

            <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-3">
              Filter Data
            </h3>

            {/* 🔥 SAME WIDTH + SIZE AS TimesheetApprovers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl">

              <select
                name="department"
                value={filters.department}
                onChange={handleChange}
                className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm"
              >
                <option value="">All Departments</option>
                {departments.map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Not Submitted">Not Submitted</option>
              </select>

            </div>
          </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Work Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length ? (
                    data.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t border-[#f1f2fb] hover:bg-[#F8F9FF] transition"
                      >
                        <td className="px-4 py-3">{row.empid}</td>
                        <td className="px-4 py-3">{row.emp_name}</td>
                        <td className="px-4 py-3">{row.department}</td>
                        <td className="px-4 py-3">{row.client_name}</td>
                        <td className="px-4 py-3">{row.work_date}</td>
                        <td className="px-4 py-3">
                          {row.status || "Not Submitted"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-500">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
