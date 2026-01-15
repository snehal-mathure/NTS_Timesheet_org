// src/pages/TimesheetApprovers.jsx
import React, { useEffect, useState } from "react";
import {
  fetchTimesheetApprovers,
  downloadCSVApprovers,
} from "../../services/AdminDashboard/TimesheetApproversService";
import axiosInstance from "../../services/AdminDashboard/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FiUserCheck } from "react-icons/fi";
import PageHeader from "../PageHeader";
import TimesheetSidebar from "./timesheetSidebar";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function TimesheetApprovers() {
  const [departments, setDepartments] = useState([]);
  const [approversList, setApproversList] = useState([]);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    department: "",
    approver: "", // ✅ NAME ONLY
  });

  /* Sidebar collapse sync */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  /* Logout */
  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/logout", {
        withCredentials: true,
      });
      if (res.data.status === "success") {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* 🔹 DATA LOAD (unchanged logic) */
  const loadData = async () => {
    try {
      const res = await fetchTimesheetApprovers(filters);
      setData(res.data.results || []);
      setDepartments(res.data.departments || []);
      setApproversList(res.data.approvers || []); // ✅ NAMES ONLY
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  /* ✅ LIVE AUTO FILTERING */
  useEffect(() => {
    loadData();
  }, [filters]);

  /* Input change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Reset */
  const handleReset = () => {
    setFilters({
      department: "",
      approver: "",
    });
  };

  /* CSV Download */
  const handleDownload = async () => {
    try {
      const url = downloadCSVApprovers(
        filters.department,
        filters.approver
      );

      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "timesheet_approvers.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("CSV download failed:", error);
      alert("Failed to download CSV");
    }
  };

  const recordCount = data.length;

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <TimesheetSidebar onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Timesheet Approvers"
          subtitle="View and manage approver mapping by department and employee."
          statLabel="Total Records"
          statValue={recordCount}
          icon={<FiUserCheck className="text-white w-6 h-6" />}
        />

        {/* MAIN CARD */}
        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center">
              <FiUserCheck className="w-6 h-6 text-[#4C6FFF]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Timesheet Approvers
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Approver mapping by department and employee.
              </p>
            </div>
          </div>

          {/* BODY */}
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

                <button
                  type="button"
                  onClick={handleDownload}
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
              </div>

              <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-3">
                Filter Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl">

                {/* Department */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Department
                  </label>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleChange}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept, i) => (
                      <option key={i} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Approver */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Approver
                  </label>
                  <select
                    name="approver"
                    value={filters.approver}
                    onChange={handleChange}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="">All Approvers</option>
                    {approversList.map((a, i) => (
                      <option key={i} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Approver ID</th>
                    <th className="px-4 py-3">Approver Name</th>
                    <th className="px-4 py-3">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length ? (
                    data.map((row, index) => (
                      <tr
                        key={index}
                        className="border-t border-[#f1f2fb] hover:bg-[#F8F9FF] transition"
                      >
                        <td className="px-4 py-3">{row.employee_id}</td>
                        <td className="px-4 py-3">{row.employee_name}</td>
                        <td className="px-4 py-3">{row.approver_id || "-"}</td>
                        <td className="px-4 py-3">{row.approver_name || "-"}</td>
                        <td className="px-4 py-3">{row.department}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500">
                        No records found for the selected filters.
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
