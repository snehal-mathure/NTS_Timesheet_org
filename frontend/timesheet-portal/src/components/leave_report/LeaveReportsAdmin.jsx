// src/components/leave_report/LeaveReportsAdmin.jsx
import React, { useEffect, useState } from "react";
import leaveReportService from "../../services/AdminDashboard/leaveReportService";
import PageHeader from "../PageHeader";
import LeaveSidebar from "./LeaveSidebar";

const SIDEBAR_KEY = "td_sidebar_collapsed";

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_KEY) === "true"
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

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

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
      (f.leaveType === "all" ||
        (item.leave_type || "").toLowerCase() === f.leaveType) &&
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
    exportCSV(filteredLeaves, "detailed_leave_report.csv", [
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
    ]);
  };

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <LeaveSidebar active="detailed" />

      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Leave Reports"
          subtitle="Detailed leave records by department and employee"
        />

        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* CARD HEADER */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#4C6FFF]" fill="none" viewBox="0 0 24 24">
                <path
                  d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Detailed Leave Report
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                View and export employee leave details
              </p>
            </div>
          </div>

          {/* CARD BODY */}
          <div className="px-6 py-6 space-y-6">

            {/* FILTER CARD */}
            <div className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-5 py-5 relative">

              {/* RESET + EXPORT */}
              <div className="absolute right-4 top-4 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <button
                  onClick={exportDetailedLeaves}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
                >
                  <svg
                    className="w-5 h-5 text-emerald-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                </button>
              </div>

              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Filter Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">

                {/* Start Date */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.start}
                    onChange={(e) =>
                      setFilters({ ...filters, start: e.target.value })
                    }
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.end}
                    onChange={(e) =>
                      setFilters({ ...filters, end: e.target.value })
                    }
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Department
                  </label>
                  <select
                    value={filters.dept}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dept: e.target.value.toLowerCase(),
                      })
                    }
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d.toLowerCase()}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Employee
                  </label>
                  <select
                    value={filters.emp}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        emp: e.target.value.toLowerCase(),
                      })
                    }
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="all">All Employees</option>
                    {employeeNames.map((e) => (
                      <option key={e} value={e.toLowerCase()}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Type */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Leave Type
                  </label>
                  <select
                    value={filters.leaveType}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        leaveType: e.target.value.toLowerCase(),
                      })
                    }
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="all">All Leave Types</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt} value={lt.toLowerCase()}>
                        {lt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status: e.target.value.toLowerCase(),
                      })
                    }
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF]">
                  <tr className="text-left text-xs font-semibold text-slate-600">
                    {["EmpID","Employee","Department","Leave Type","Start","End","Days","Status","Reason","Approved By"]
                      .map(h => (
                        <th key={h} className="px-4 py-3">{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length ? (
                    filteredLeaves.map((l) => (
                      <tr key={l.id} className="border-t hover:bg-[#F8F9FF]">
                        <td className="px-4 py-3">{l.empid}</td>
                        <td className="px-4 py-3">{l.employee_name}</td>
                        <td className="px-4 py-3">{l.dept}</td>
                        <td className="px-4 py-3">{l.leave_type}</td>
                        <td className="px-4 py-3">{l.st_dt}</td>
                        <td className="px-4 py-3">{l.ed_dt}</td>
                        <td className="px-4 py-3">{l.total_days}</td>
                        <td className="px-4 py-3">{l.status}</td>
                        <td className="px-4 py-3">{l.reason}</td>
                        <td className="px-4 py-3">{l.approved_by}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-6 text-center text-slate-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
            <p className="text-[11px] text-slate-500">
              Tip: Use filters to refine leave records before exporting.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
