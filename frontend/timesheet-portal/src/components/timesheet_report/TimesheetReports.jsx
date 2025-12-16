// src/pages/TimesheetReports.jsx
import React, { useEffect, useState } from "react";
import {
  fetchTimesheetReports,
  downloadCSV,
} from "../../services/AdminDashboard/TimesheetReports";
import { getDepartments } from "../../services/authservice";
import axiosInstance from "../../services/AdminDashboard/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import PageHeader from "../PageHeader";
import TimesheetSidebar from "./timesheetSidebar";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function TimesheetReports() {
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);

  // Filters (UNCHANGED)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [billability, setBillability] = useState("");

  const navigate = useNavigate();

  // Sidebar collapse (UNCHANGED)
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

  // Logout (UNCHANGED)
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

  // Load data (UNCHANGED)
  useEffect(() => {
    loadDepartments();
    loadReport();
  }, []);

  const loadDepartments = async () => {
    try {
      const deptData = await getDepartments();
      setDepartments(deptData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadReport = async () => {
    try {
      const res = await fetchTimesheetReports({});
      setData(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Reset (UNCHANGED)
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setSelectedDepartment("");
    setBillability("");
    loadReport();
  };

  // Download CSV (UNCHANGED)
  const handleDownload = async () => {
    try {
      const url = downloadCSV(startDate, endDate, selectedDepartment, billability);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to download file");
      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "timesheet_report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("CSV download failed:", error);
      alert("Failed to download CSV!");
    }
  };

  // LIVE FILTERING (UNCHANGED)
  const filteredData = data.filter((row) => {
    const emp = (row.emp_name || "").toLowerCase();
    const project = (row.project_name || "").toLowerCase();
    const client = (row.client_name || "").toLowerCase();

    const searchMatch =
      searchTerm === "" ||
      emp.includes(searchTerm.toLowerCase()) ||
      project.includes(searchTerm.toLowerCase()) ||
      client.includes(searchTerm.toLowerCase());

    const deptMatch =
      !selectedDepartment || row.department === selectedDepartment;

    const billableMatch =
      !billability || row.project_billability === billability;

    const rowDate = row.work_date ? new Date(row.work_date) : null;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch =
      (!start || (rowDate && rowDate >= start)) &&
      (!end || (rowDate && rowDate <= end));

    return searchMatch && deptMatch && dateMatch && billableMatch;
  });

  const recordCount = filteredData.length;

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <TimesheetSidebar onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Timesheet Reports"
          subtitle="View, filter and export detailed timesheet entries."
          statLabel="Total Records"
          statValue={recordCount}
          icon={<FiFileText className="text-white w-6 h-6" />}
        />

        {/* MAIN CARD (Dept Billability Style) */}
        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* CARD HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Detailed Timesheet Entries
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                View, filter and export employee timesheet data.
              </p>
            </div>
          </div>

          {/* CARD BODY */}
          <div className="px-6 py-6 md:py-7 space-y-6">

            {/* FILTER CARD */}
            <form className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-5 md:px-5 relative">

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

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                {/* Start Date */}
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-2xl px-3 py-2 text-sm border" />

                {/* End Date */}
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-2xl px-3 py-2 text-sm border" />

                {/* Department */}
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="rounded-2xl px-3 py-2 text-sm border">
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.dept_name}>{d.dept_name}</option>
                  ))}
                </select>

                {/* Billability */}
                <select value={billability} onChange={(e) => setBillability(e.target.value)} className="rounded-2xl px-3 py-2 text-sm border">
                  <option value="">All</option>
                  <option value="Billable">Billable</option>
                  <option value="Non-Billable">Non-Billable</option>
                </select>
              </div>
            </form>

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search employee / project / client..."
              className="border border-[#d9dcef] bg-[#F8F9FF] rounded-2xl px-3 py-2 text-sm w-full md:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Billability</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length ? (
                    filteredData.map((row, i) => (
                      <tr key={i} className="border-t hover:bg-[#F8F9FF] transition">
                        <td className="px-4 py-3">{row.empid}</td>
                        <td className="px-4 py-3">{row.emp_name}</td>
                        <td className="px-4 py-3">{row.department}</td>
                        <td className="px-4 py-3">{row.client_name}</td>
                        <td className="px-4 py-3">{row.project_name}</td>
                        <td className="px-4 py-3">{row.project_billability}</td>
                        <td className="px-4 py-3">{row.hours_worked}</td>
                        <td className="px-4 py-3">{row.work_date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-6 text-slate-500">
                        No records found.
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
