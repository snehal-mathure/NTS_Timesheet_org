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

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [billability, setBillability] = useState("");

  const navigate = useNavigate();

  // Sidebar collapse
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

  const mainMarginClass = sidebarCollapsed ? "md:ml-16" : "md:ml-56";

  // Logout
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

  // Load data
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

  // RESET
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setSelectedDepartment("");
    setBillability("");
    loadReport();
  };

  // DOWNLOAD CSV
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

  // LIVE AUTO FILTERING
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

        <div className="space-y-6">
          {/* ---------------- FILTERS ---------------- */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 md:px-8 py-6 relative">

            {/* RESET BUTTON TOP-RIGHT */}
            <div className="absolute right-4 top-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-100 
                           text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Reset
              </button>
            </div>

            {/* NO APPLY BUTTON - LIVE FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">

              {/* Start Date */}
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                  Start Date
                </p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                />
              </div>

              {/* End Date */}
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                  End Date
                </p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                />
              </div>

              {/* Department */}
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                  Department
                </p>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.dept_name}>
                      {dept.dept_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billability */}
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                  Billability
                </p>
                <select
                  value={billability}
                  onChange={(e) => setBillability(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <option value="">All</option>
                  <option value="Billable">Billable</option>
                  <option value="Non-Billable">Non-Billable</option>
                </select>
              </div>
            </div>
          </section>

          {/* ---------------- SEARCH + EXPORT CSV ---------------- */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <input
              type="text"
              placeholder="Search employee / project / client..."
              className="border border-[#d9dcef] bg-[#F8F9FF] rounded-2xl px-3 py-2 text-sm w-full md:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* EXPORT CSV BUTTON */}
            <div className="relative group overflow-visible">
              <button
                onClick={handleDownload}
                className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center 
                           hover:bg-emerald-100 transition shadow-sm"
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

              {/* Tooltip */}
              <div
                className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 
                           group-hover:opacity-100 bg-slate-800 text-white 
                           text-[10px] px-2 py-1 rounded-md shadow transition"
              >
                Download CSV
              </div>
            </div>
          </div>

          {/* ---------------- TABLE ---------------- */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F3F5FF] text-slate-600 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Project</th>
                  <th className="px-4 py-3 text-left">Billability</th>
                  <th className="px-4 py-3 text-left">Hours</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-slate-100">
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
                    <td colSpan={8} className="text-center py-6 text-slate-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
