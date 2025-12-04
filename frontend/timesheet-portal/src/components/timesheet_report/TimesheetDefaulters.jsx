// src/pages/TimesheetDefaulters.jsx
import React, { useEffect, useState } from "react";
import {
  fetchTimesheetDefaulters,
  downloadCSVDefaulters,
} from "../../services/AdminDashboard/TimesheetDefaultersService";
import axiosInstance from "../../services/AdminDashboard/axiosInstance";
import { useNavigate, NavLink, Link } from "react-router-dom";
import {
  FiFileText,
  FiUserCheck,
  FiAlertCircle,
  FiLogOut,
  FiArrowLeft,
} from "react-icons/fi";
import PageHeader from "../PageHeader";

export default function TimesheetDefaulters() {
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const initialFilters = {
    start_date: "",
    end_date: "",
    department: "",
    status: "",
  };

  const [filters, setFilters] = useState(initialFilters);

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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchTimesheetDefaulters(filters);
      if (!res.error) {
        setDepartments(res.data.departments || []);
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadData();
  };

  const recordCount = data.length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar – same design family as TimesheetReports / Approvers */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/90 backdrop-blur border-r border-slate-200 shadow-sm">
        {/* Brand / header */}
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              <Link to="/dashboard">
                <FiArrowLeft className="text-lg" />
              </Link>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Timesheet Management
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink
            to="/timesheet-reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiFileText className="text-base" />
            <span>Timesheet Reports</span>
          </NavLink>

          <NavLink
            to="/timesheet-approvers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive
                ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiUserCheck className="text-base" />
            <span>Timesheet Approvers</span>
          </NavLink>

          <NavLink
            to="/timesheet-defaulters"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiAlertCircle className="text-base" />
            <span>Timesheet Defaulters</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <FiLogOut className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT – same structure / scroll as Reports & Approvers */}
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Timesheet Defaulters"
            subtitle="View employees with missing or pending timesheet submissions."
            statLabel="Total Records"
            statValue={recordCount}
            icon={<FiAlertCircle className="text-white w-6 h-6" />}
          />

          <div className="space-y-6">
            {/* Filters card */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 md:px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Reset
                </button>
              </div>

              <form onSubmit={handleFilter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  {/* Start Date */}
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      Start Date
                    </p>
                    <input
                      type="date"
                      name="start_date"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filters.start_date}
                      onChange={handleChange}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      End Date
                    </p>
                    <input
                      type="date"
                      name="end_date"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filters.end_date}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      Department
                    </p>
                    <select
                      name="department"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filters.department}
                      onChange={handleChange}
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      Status
                    </p>
                    <select
                      name="status"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filters.status}
                      onChange={handleChange}
                    >
                      <option value="">All Status</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Not Submitted">Not Submitted</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#4C6FFF] text-white rounded-2xl px-6 py-2 text-xs font-semibold shadow hover:bg-[#3e54d4]"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </section>

            {/* Count + Download */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {recordCount}
                </span>{" "}
                {recordCount === 1 ? "record" : "records"} based on current
                filters.
              </p>

              <a
                href={downloadCSVDefaulters(
                  filters.start_date,
                  filters.end_date,
                  filters.department,
                  filters.status
                )}
                className="border border-emerald-400 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-100"
              >
                ⬇️ Download CSV
              </a>
            </div>

            {/* Table */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#F3F5FF] text-slate-600 text-[11px] uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee ID</th>
                    <th className="px-4 py-3 text-left">Employee Name</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th className="px-4 py-3 text-left">Work Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length > 0 ? (
                    data.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-slate-100"
                      >
                        <td className="px-4 py-3">{row.empid}</td>
                        <td className="px-4 py-3">{row.emp_name}</td>
                        <td className="px-4 py-3">
                          {row.department || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {row.client_name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {row.work_date || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                            {row.status || "Not Submitted"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="text-center py-6 text-slate-500 text-xs"
                        colSpan={6}
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
