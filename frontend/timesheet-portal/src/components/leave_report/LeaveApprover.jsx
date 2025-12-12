
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

  // track sidebar collapse (same logic as onboarding)
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

  // dynamic margins (same as onboarding)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-56";

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

  const filteredApprovers = approvers.filter((ap) => {
    return (
      (approverFilters.dept === "all" ||
        (ap.dept || "").toLowerCase() === approverFilters.dept) &&
      (approverFilters.emp === "all" ||
        (ap.employee_name || "").toLowerCase() === approverFilters.emp)
    );
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
    const columns = ["empid", "employee_name", "dept", "approver_id", "approver_name"];
    exportCSV(filteredApprovers, "leave_approvers.csv", columns);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex">
      <LeaveSidebar active="approvers" />

      <main
        className={`flex-1 transition-all duration-200 px-6 md:px-10 py-8 ${mainMarginClass}`}
      >
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Leave Approvers"
            subtitle="View and export leave approver mappings."
            statLabel="Total Approvers"
            statValue={approvers?.length ?? 0}
          />

          <section className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Filters</h3>

                <button
                  onClick={resetApproverFilters}
                  className="text-xs font-medium text-[#2563eb] hover:underline"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={approverFilters.dept}
                    onChange={(e) =>
                      setApproverFilters({
                        ...approverFilters,
                        dept: e.target.value.toLowerCase(),
                      })
                    }
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option value={d.toLowerCase()} key={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Employee
                  </label>
                  <select
                    value={approverFilters.emp}
                    onChange={(e) =>
                      setApproverFilters({
                        ...approverFilters,
                        emp: e.target.value.toLowerCase(),
                      })
                    }
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="all">All Employees</option>
                    {employeeNames.map((e) => (
                      <option value={e.toLowerCase()} key={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <button
                  onClick={exportApprovers}
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-6 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">EmpID</th>
                    <th className="px-4 py-3 text-left">Employee Name</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Approver ID</th>
                    <th className="px-4 py-3 text-left">Approver Name</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApprovers.map((ap, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{ap.empid}</td>
                      <td className="px-4 py-3">{ap.employee_name}</td>
                      <td className="px-4 py-3">{ap.dept}</td>
                      <td className="px-4 py-3">{ap.approver_id}</td>
                      <td className="px-4 py-3">{ap.approver_name}</td>
                    </tr>
                  ))}

                  {filteredApprovers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-slate-500 text-xs"
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
