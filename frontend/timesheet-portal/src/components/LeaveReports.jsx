// src/pages/LeaveReports.jsx
import React, { useEffect, useMemo, useState } from "react";
import leaveService from "../services/AdminDashboard/leaveService";
import { useNavigate } from "react-router-dom";

/* Helper: CSV escaping */
function csvEscape(text = "") {
  const s = String(text == null ? "" : text);
  // replace double quotes with two double quotes, replace commas with semicolons (to avoid breaking CSV),
  // then wrap in double quotes
  return `"${s.replace(/"/g, '""').replace(/,/g, ";")}"`;
}

function downloadCSV(rows, filename = "export.csv") {
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeaveReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    history_leaves: [],
    departments: [],
    employee_names: [],
    leave_types: [],
    approvers: [],
  });

  const [activeTab, setActiveTab] = useState("detailed");

  // filters for detailed table
  const [filters, setFilters] = useState({
    dept: "all",
    employee: "all",
    leaveType: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  // filters for approvers
  const [approverFilters, setApproverFilters] = useState({
    dept: "all",
    employee: "all",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await leaveService.fetchLeaveReports();
        setData({
          history_leaves: res.history_leaves || [],
          departments: res.departments || [],
          employee_names: res.employee_names || [],
          leave_types: res.leave_types || [],
          approvers: res.approvers || [],
        });
      } catch (err) {
        console.error("Failed to fetch leave reports", err);
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filteredLeaves = useMemo(() => {
    const { dept, employee, leaveType, status, startDate, endDate } = filters;
    return data.history_leaves.filter((row) => {
      const rowDept = (row.dept || "").toLowerCase();
      const rowEmp = (row.employee_name || "").toLowerCase();
      const rowType = (row.leave_type || "").toLowerCase();
      const rowStatus = (row.status || "").toLowerCase();
      const startOk = !startDate || (row.st_dt && row.st_dt >= startDate);
      const endOk = !endDate || (row.ed_dt && row.ed_dt <= endDate);
      const deptOk = dept === "all" || rowDept === dept.toLowerCase();
      const empOk = employee === "all" || rowEmp === employee.toLowerCase();
      const typeOk = leaveType === "all" || rowType === leaveType.toLowerCase();
      const statusOk = status === "all" || rowStatus === status.toLowerCase();
      return startOk && endOk && deptOk && empOk && typeOk && statusOk;
    });
  }, [data.history_leaves, filters]);

  const filteredApprovers = useMemo(() => {
    const { dept, employee } = approverFilters;
    return data.approvers.filter((row) => {
      const rowDept = (row.dept || "").toLowerCase();
      const rowEmp = (row.employee_name || "").toLowerCase();
      const deptOk = dept === "all" || rowDept === dept.toLowerCase();
      const empOk = employee === "all" || rowEmp === employee.toLowerCase();
      return deptOk && empOk;
    });
  }, [data.approvers, approverFilters]);

  const exportDetailedCSV = () => {
    const header = [
      "EmpID",
      "Employee Name",
      "Department",
      "Leave Type",
      "Start Date",
      "End Date",
      "Total Days",
      "Status",
      "Reason",
      "Approved By",
    ];
    const rows = [header];
    filteredLeaves.forEach((r) => {
      rows.push([
        csvEscape(r.empid),
        csvEscape(r.employee_name),
        csvEscape(r.dept),
        csvEscape(r.leave_type),
        csvEscape(r.st_dt),
        csvEscape(r.ed_dt),
        csvEscape(r.total_days),
        csvEscape(r.status),
        csvEscape(r.reason),
        csvEscape(r.approved_by),
      ]);
    });
    downloadCSV(rows, "detailed_leave_report.csv");
  };

  const exportApproversCSV = () => {
    const header = ["EmpID", "Employee Name", "Department", "Approver ID", "Approver Name"];
    const rows = [header];
    filteredApprovers.forEach((r) => {
      rows.push([
        csvEscape(r.empid),
        csvEscape(r.employee_name),
        csvEscape(r.dept),
        csvEscape(r.approver_id),
        csvEscape(r.approver_name),
      ]);
    });
    downloadCSV(rows, "leave_approvers.csv");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading leave reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-900 text-white p-4 min-h-screen">
        <div className="mb-4 border-b border-sky-700 pb-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="block w-full text-left text-sm font-medium mb-2 hover:underline"
          >
            ← Back to Admin Dashboard
          </button>
          <h2 className="text-lg font-semibold">Leave Reports</h2>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  activeTab === "detailed" ? "bg-white text-sky-900 font-semibold" : "hover:bg-sky-800/60"
                }`}
                onClick={() => setActiveTab("detailed")}
              >
                Detailed Leave Report
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  activeTab === "approvers" ? "bg-white text-sky-900 font-semibold" : "hover:bg-sky-800/60"
                }`}
                onClick={() => setActiveTab("approvers")}
              >
                List of Leave Approvers
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Detailed */}
        <section className={`${activeTab !== "detailed" ? "hidden" : "block"}`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-slate-800">Detailed Leave Report</h1>
            <button
              onClick={exportDetailedCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded"
            >
              Export as CSV
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Department */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Department</label>
                <select
                  value={filters.dept}
                  onChange={(e) => setFilters((s) => ({ ...s, dept: e.target.value }))}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  {data.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Employee</label>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters((s) => ({ ...s, employee: e.target.value }))}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  {data.employee_names.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Leave Type</label>
                <select
                  value={filters.leaveType}
                  onChange={(e) => setFilters((s) => ({ ...s, leaveType: e.target.value }))}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  {data.leave_types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((s) => ({ ...s, startDate: e.target.value }))}
                  className="border rounded px-2 py-1"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((s) => ({ ...s, endDate: e.target.value }))}
                  className="border rounded px-2 py-1"
                />
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() =>
                    setFilters({
                      dept: "all",
                      employee: "all",
                      leaveType: "all",
                      status: "all",
                      startDate: "",
                      endDate: "",
                    })
                  }
                  className="px-3 py-1 border rounded"
                >
                  Reset
                </button>
                <button onClick={() => {}} className="px-3 py-1 bg-sky-700 text-white rounded">
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">EmpID</th>
                  <th className="px-3 py-2 text-left">Employee Name</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Leave Type</th>
                  <th className="px-3 py-2 text-left">Start Date</th>
                  <th className="px-3 py-2 text-left">End Date</th>
                  <th className="px-3 py-2 text-left">Total Days</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{row.empid}</td>
                    <td className="px-3 py-2">{row.employee_name}</td>
                    <td className="px-3 py-2">{row.dept}</td>
                    <td className="px-3 py-2">{row.leave_type}</td>
                    <td className="px-3 py-2">{row.st_dt}</td>
                    <td className="px-3 py-2">{row.ed_dt}</td>
                    <td className="px-3 py-2">{row.total_days}</td>
                    <td
                      className={`px-3 py-2 ${
                        row.status === "Approved" ? "text-emerald-600" : row.status === "Rejected" ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {row.status}
                    </td>
                    <td className="px-3 py-2" title={row.reason}>
                      {row.reason ? (row.reason.length > 40 ? `${row.reason.slice(0, 40)}...` : row.reason) : ""}
                    </td>
                    <td className="px-3 py-2">{row.approved_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Approvers */}
        <section className={`${activeTab !== "approvers" ? "hidden" : "block"}`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-slate-800">List of Leave Approvers</h1>
            <button
              onClick={exportApproversCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded"
            >
              Export as CSV
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Department</label>
                <select
                  value={approverFilters.dept}
                  onChange={(e) => setApproverFilters((s) => ({ ...s, dept: e.target.value }))}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  {data.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Employee</label>
                <select
                  value={approverFilters.employee}
                  onChange={(e) => setApproverFilters((s) => ({ ...s, employee: e.target.value }))}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  {data.employee_names.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setApproverFilters({ dept: "all", employee: "all" })}
                  className="px-3 py-1 border rounded"
                >
                  Reset
                </button>
                <button onClick={() => {}} className="px-3 py-1 bg-sky-700 text-white rounded">
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">EmpID</th>
                  <th className="px-3 py-2 text-left">Employee Name</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Approver ID</th>
                  <th className="px-3 py-2 text-left">Approver Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovers.map((ap) => (
                  <tr key={ap.empid} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{ap.empid}</td>
                    <td className="px-3 py-2">{ap.employee_name}</td>
                    <td className="px-3 py-2">{ap.dept}</td>
                    <td className="px-3 py-2">{ap.approver_id}</td>
                    <td className="px-3 py-2">{ap.approver_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
