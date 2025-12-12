

// src/components/leave_report/LeaveReportsAdmin.jsx
import React, { useEffect, useState } from "react";
import leaveReportService from "../../services/AdminDashboard/leaveReportService";
import PageHeader from "../PageHeader";
import LeaveSidebar from "./LeaveSidebar";

const SIDEBAR_KEY = "td_sidebar_collapsed"; // same key used in OnboardingSidebar.jsx

export default function LeaveReportsAdmin() {
  const [historyLeaves, setHistoryLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [filters, setFilters] = useState({
    dept: "all",
    emp: "all",
    status: "all",
    leaveType: "all",
    start: "",
    end: "",
  });

  // track sidebar collapsed state (reads same storage key as OnboardingSidebar)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  useEffect(() => {
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    };
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  // IMPORTANT: margins match the sidebar widths exactly to prevent overlap
  // expanded sidebar w-56  -> md:ml-56
  // collapsed sidebar w-16 -> md:ml-16
  const mainMarginClass = sidebarCollapsed ? "md:ml-16" : "md:ml-56";

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    const res = await leaveReportService.getLeaveReports();
    if (!res) return;
    setHistoryLeaves(res.history_leaves || []);
    setDepartments(res.departments || []);
    setEmployeeNames(res.employee_names || []);
    setLeaveTypes(res.leave_types || []);
  };

  const filteredLeaves = historyLeaves.filter((item) => {
    const f = filters;
    return (
      (f.status === "all" || (item.status || "").toLowerCase() === f.status) &&
      (f.dept === "all" || (item.dept || "").toLowerCase() === f.dept) &&
      (f.emp === "all" || (item.employee_name || "").toLowerCase() === f.emp) &&
      (f.leaveType === "all" || (item.leave_type || "").toLowerCase() === f.leaveType) &&
      (!f.start || item.st_dt >= f.start) &&
      (!f.end || item.ed_dt <= f.end)
    );
  });

  const resetFilters = () => {
    setFilters({
      dept: "all",
      emp: "all",
      status: "all",
      leaveType: "all",
      start: "",
      end: "",
    });
  };

  const exportCSV = (data, filename, columns) => {
    const header = columns.join(",");
    const rows = data.map((row) =>
      columns
        .map((key) => {
          let value = row[key] ?? "";
          value = String(value).replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportDetailedLeaves = () => {
    const columns = [
      "empid",
      "employee_name",
      "dept",
      "leave_type",
      "st_dt",
      "ed_dt",
      "total_days",
      "status",
      "reason",
      "approved_by",
    ];
    exportCSV(filteredLeaves, "detailed_leave_report.csv", columns);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex">
      {/* Fixed collapsible sidebar (Onboarding-style). LeaveSidebar should implement same collapse key. */}
      <LeaveSidebar active="detailed" />

      {/* Main content — shifts according to sidebarCollapsed */}
      <main
        className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
        style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
      >
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Leave Reports"
            subtitle="View detailed leave entries filtered by date range, employee and department."
            statLabel="Total Records"
            statValue={historyLeaves?.length ?? 0}
          />

          <section className="space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm md:text-base font-semibold text-slate-900">Filters</h3>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-medium text-[#2563eb] hover:underline"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.start}
                    onChange={(e) => setFilters({ ...filters, start: e.target.value })}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.end}
                    onChange={(e) => setFilters({ ...filters, end: e.target.value })}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                    Department
                  </label>
                  <select
                    value={filters.dept}
                    onChange={(e) => setFilters({ ...filters, dept: e.target.value.toLowerCase() })}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d.toLowerCase()}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                    Employee
                  </label>
                  <select
                    value={filters.emp}
                    onChange={(e) => setFilters({ ...filters, emp: e.target.value.toLowerCase() })}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                  >
                    <option value="all">All Employees</option>
                    {employeeNames.map((emp) => (
                      <option key={emp} value={emp.toLowerCase()}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                    Leave Type
                  </label>
                  <select
                    value={filters.leaveType}
                    onChange={(e) => setFilters({ ...filters, leaveType: e.target.value.toLowerCase() })}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                  >
                    <option value="all">All Leave Types</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt} value={lt.toLowerCase()}>
                        {lt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value.toLowerCase() })}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <button className="rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs md:text-sm font-medium px-8 py-2 shadow-md">
                  Apply Filters
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs md:text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">{filteredLeaves.length}</span>{" "}
                records based on current filters.
              </p>

              <button
                onClick={exportDetailedLeaves}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-xs md:text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <span>Download CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">EmpID</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Leave Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Start</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">End</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Days</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reason</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Approved By</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeaves.map((l) => (
                      <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap">{l.empid}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.employee_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.dept}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.leave_type}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.st_dt}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.ed_dt}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.total_days}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            l.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : l.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>{l.status}</span>
                        </td>
                        <td className="px-4 py-3"><span className="line-clamp-2 text-xs">{l.reason}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">{l.approved_by}</td>
                      </tr>
                    ))}

                    {filteredLeaves.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-slate-500 text-xs">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
