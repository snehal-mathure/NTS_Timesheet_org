import React, { useEffect, useState } from "react";
import {
  fetchTimesheetReports,
  downloadCSV,
} from "../../services/AdminDashboard/TimesheetReports";
// import { getDepartments } from "../../services/authservice";
// import { getDepartments } from "../../services/authService";
import axiosInstance from "../../services/AdminDashboard/axiosInstance";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { FiFileText, FiUserCheck, FiAlertCircle, FiLogOut, FiArrowLeft } from "react-icons/fi";
import PageHeader from "../PageHeader";




export default function TimesheetReports() {
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const initialFilters = {
    start_date: "",
    end_date: "",
    department: "",
  };

  const [filters, setFilters] = useState(initialFilters);

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

  useEffect(() => {
    loadDepartments();
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const res = await fetchTimesheetReports(filters);
      setData(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadReport();
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadReport();
  };

  // CSV download (same logic, just styled button)
  const handleDownload = async () => {
    try {
      const url = downloadCSV(
        filters.start_date,
        filters.end_date,
        filters.department
      );
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

  const recordCount = data.length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar – same design as TimesheetDefaulters */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white/90 backdrop-blur border-r border-slate-200 shadow-sm">
        {/* Brand / header */}
        <div className="px-6 py-5 border-b border-slate-200">
          {/* <Link
            to="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <FiArrowLeft className="text-sm" />
            <span className="px-7">Back to Dashboard</span>
          </Link> */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              <Link
                to="/dashboard"
              >
                <FiArrowLeft className="text-lg" />
              </Link>
            </div>
            <div>
              {/* ⬇️ renamed here */}
              <p className="text-sm font-semibold text-slate-800">
                Timesheet Management
              </p>

            </div>
          </div>


        </div>

        {/* Nav links */}
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

      {/* Main Section – styled like Defaulters page */}
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Page Header */}
          <PageHeader
            title="Timesheet Reports"
            subtitle="View, filter and export detailed timesheet entries."
            statLabel="Total Records"
            statValue={recordCount}
            icon={<FiFileText className="text-white w-6 h-6" />}
          />

          {/* Filters + Table Wrapper */}
          <div className="space-y-6">

            {/* Filters card */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 md:px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Filters</h2>

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
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      Start Date
                    </p>
                    <input
                      type="date"
                      name="start_date"
                      value={filters.start_date}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      End Date
                    </p>
                    <input
                      type="date"
                      name="end_date"
                      value={filters.end_date}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                      Department
                    </p>
                    <select
                      name="department"
                      value={filters.department}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.dept_name}>
                          {dept.dept_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#4C6FFF] text-white rounded-2xl px-6 py-2 text-xs font-semibold shadow hover:bg-[#3e54d4]"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </section>

            {/* Summary + CSV */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">{recordCount}</span>{" "}
                records
              </p>

              <button
                onClick={handleDownload}
                className="border border-emerald-400 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-100"
              >
                ⬇️ Download CSV
              </button>
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
                    <th className="px-4 py-3 text-left">Project</th>
                    <th className="px-4 py-3 text-left">Billability</th>
                    <th className="px-4 py-3 text-left">Hours</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length > 0 ? (
                    data.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-slate-100"
                      >
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
                      <td
                        colSpan={8}
                        className="text-center py-6 text-slate-500 text-xs"
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
