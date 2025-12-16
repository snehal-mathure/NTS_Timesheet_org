import React, { useEffect, useState } from "react";
import leaveReportService from "../../services/AdminDashboard/leaveReportService";
import PageHeader from "../PageHeader";
import LeaveSidebar from "./LeaveSidebar";

const SIDEBAR_KEY = "td_sidebar_collapsed";

export default function LeaveApprovers() {
  const [approvers, setApprovers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);

  const [approverFilters, setApproverFilters] = useState({
    dept: "all",
    emp: "all",
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
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

    setApprovers(res.approvers || []);
    setDepartments(res.departments || []);
    setEmployeeNames(res.employee_names || []);
  };

  /* 🔥 LIVE AUTO FILTERING (FIXED MATCHING) */
  const filteredApprovers = approvers.filter((ap) => {
    const rowDept = (ap.dept || "").toLowerCase();
    const rowEmp = (ap.employee_name || "").toLowerCase();

    const deptFilter = approverFilters.dept;
    const empFilter = approverFilters.emp;

    const deptMatch =
      deptFilter === "all" || rowDept.includes(deptFilter);

    const empMatch =
      empFilter === "all" || rowEmp.includes(empFilter);

    return deptMatch && empMatch;
  });

  const resetApproverFilters = () => {
    setApproverFilters({ dept: "all", emp: "all" });
  };

  const exportCSV = (data, filename, columns) => {
    const header = columns.join(",");
    const rows = data.map((row) =>
      columns
        .map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportApprovers = () => {
    exportCSV(filteredApprovers, "leave_approvers.csv", [
      "empid",
      "employee_name",
      "dept",
      "approver_id",
      "approver_name",
    ]);
  };

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <LeaveSidebar active="approvers" />

      <div className="max-w-5xl mx-auto">
        <PageHeader title="Leave Approvers" subtitle="Leave Management Reports" />

        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* HEADER */}
          <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Leave Approver Mapping
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              View and export employee to approver relationships.
            </p>
          </div>

          {/* BODY */}
          <div className="px-6 py-6 space-y-6">

            {/* FILTER CARD */}
            <div className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-5 relative">

              {/* RESET + EXPORT */}
              <div className="absolute right-4 top-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetApproverFilters}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={exportApprovers}
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

              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Filter Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">

                {/* Department */}
                <select
                  value={approverFilters.dept}
                  onChange={(e) =>
                    setApproverFilters((prev) => ({
                      ...prev,
                      dept: e.target.value.toLowerCase(),
                    }))
                  }
                  className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d.toLowerCase()}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Employee */}
                <select
                  value={approverFilters.emp}
                  onChange={(e) =>
                    setApproverFilters((prev) => ({
                      ...prev,
                      emp: e.target.value.toLowerCase(),
                    }))
                  }
                  className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm"
                >
                  <option value="all">All Employees</option>
                  {employeeNames.map((e) => (
                    <option key={e} value={e.toLowerCase()}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Emp ID</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Approver ID</th>
                    <th className="px-4 py-3">Approver Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprovers.length ? (
                    filteredApprovers.map((ap, i) => (
                      <tr key={i} className="border-t hover:bg-[#F8F9FF]">
                        <td className="px-4 py-3">{ap.empid}</td>
                        <td className="px-4 py-3">{ap.employee_name}</td>
                        <td className="px-4 py-3">{ap.dept}</td>
                        <td className="px-4 py-3">{ap.approver_id}</td>
                        <td className="px-4 py-3">{ap.approver_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
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
