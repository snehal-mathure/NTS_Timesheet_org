// src/pages/ApprovalHistory.jsx
import React, { useEffect, useState, useMemo } from "react";
import UserDashboardSidebar from "../components/UserDashboardSidebar";
import PageHeader from "../components/PageHeader";
import leaveService from "../services/AdminDashboard/leaveService";
import dayjs from "dayjs";

const SIDEBAR_KEY = "td_sidebar_collapsed";
const accent = "#4C6FFF";

export default function ApprovalHistoryLeaves() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]); // array of leave history rows
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filters
  const [deptFilter, setDeptFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [empNameFilter, setEmpNameFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // UI state
  const [expandedId, setExpandedId] = useState(null);

  // layout responsive to sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");

  useEffect(() => {
    fetchAll();

    const onCustom = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) setSidebarCollapsed(e.newValue === "true");
    };
    window.addEventListener("td_sidebar_change", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("td_sidebar_change", onCustom);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const res = await leaveService.getApprovalHistory();
      // Expecting: { history: [...], departments: [...], employees: [...] }
      setHistory(res.history || []);
      setDepartments(res.departments || []);
      setEmployees(res.employees || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load approval history.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    return history.filter((row) => {
      if (deptFilter !== "all" && row.dept !== deptFilter) return false;
      if (leaveTypeFilter !== "all" && row.leave_type !== leaveTypeFilter) return false;
      if (empNameFilter !== "all" && row.employee_name !== empNameFilter) return false;
      if (startDateFilter && dayjs(row.st_dt).isBefore(dayjs(startDateFilter), "day")) return false;
      if (endDateFilter && dayjs(row.st_dt).isAfter(dayjs(endDateFilter), "day")) return false;
      return true;
    });
  }, [history, deptFilter, leaveTypeFilter, empNameFilter, startDateFilter, endDateFilter]);

  function resetFilters() {
    setDeptFilter("all");
    setLeaveTypeFilter("all");
    setEmpNameFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  }

  function toggleExpand(row) {
    if (expandedId === row.id) {
      setExpandedId(null);
    } else {
      setExpandedId(row.id);
      // Optionally could fetch deeper details here if not present (like leave entries)
    }
  }

  function downloadFilteredCSV() {
    if (filteredRows.length === 0) {
      alert("No data to download. Please apply filters correctly.");
      return;
    }

    const headers = ["Employee", "Department", "Leave Type", "Start Date", "End Date", "Total Days", "Reason", "Status", "Comments"];
    let csv = headers.join(",") + "\n";

    filteredRows.forEach((r) => {
      const row = [
        r.employee_name,
        r.dept,
        r.leave_type,
        r.st_dt,
        r.ed_dt,
        String(r.total_days),
        (r.reason || "").replace(/"/g, '""'),
        r.status,
        (r.comments || "").replace(/"/g, '""')
      ].map((cell) => `"${cell}"`);
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `approval_history_filtered_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // compute main margin responsive to sidebarCollapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-64";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-slate-600">Loading approval history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserDashboardSidebar />

      <main className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6`}>
        <div className="max-w-6xl mx-auto space-y-5">
          <PageHeader
            section="Leaves"
            title="Approval History"
            description="View historical leave approvals and export filtered data."
          />

          <div className="bg-white/95 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-[#4C6FFF]" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3h14v4H5zM5 11h14v10H5z" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Approval History</h2>
                  <p className="text-sm text-slate-500">Browse past leave approvals and export CSVs.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadFilteredCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white shadow"
                  style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
                >
                  Download Filtered CSV
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Leave Type</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                    value={leaveTypeFilter}
                    onChange={(e) => setLeaveTypeFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Paid Time Off">Paid Time Off</option>
                    <option value="Restricted Holiday">Restricted Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                    value={empNameFilter}
                    onChange={(e) => setEmpNameFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    {employees.map((emp) => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                  />
                </div>

                <div className="flex items-end gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-2xl border border-[#e0e4ff] bg-white text-sm"
                  >
                    Reset
                  </button>
                  <div className="text-sm text-slate-500 ml-auto">Showing {filteredRows.length} record(s)</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
                  <thead className="bg-[#F3F5FF]">
                    <tr className="text-slate-600">
                      <th className="p-3 text-left">Employee</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Leave Type</th>
                      <th className="p-3 text-left">Start Date</th>
                      <th className="p-3 text-left">End Date</th>
                      <th className="p-3 text-left">Total Days</th>
                      <th className="p-3 text-left">Reason</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Comments</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {filteredRows.map((r) => (
                      <React.Fragment key={r.id}>
                        <tr
                          className="hover:bg-[#FBFDFF] cursor-pointer"
                          onClick={() => toggleExpand(r)}
                        >
                          <td className="p-3">{r.employee_name}</td>
                          <td className="p-3">{r.dept}</td>
                          <td className="p-3">{r.leave_type}</td>
                          <td className="p-3">{r.st_dt}</td>
                          <td className="p-3">{r.ed_dt}</td>
                          <td className="p-3">{Number(r.total_days).toFixed(1)}</td>
                          <td className="p-3 text-slate-600" title={r.reason}>
                            {r.reason?.length > 30 ? r.reason.slice(0, 30) + "..." : r.reason}
                          </td>
                          <td className={`p-3 font-semibold ${r.status === "Approved" ? "text-emerald-700" : "text-rose-600"}`}>
                            {r.status}
                          </td>
                          <td className="p-3">{r.comments}</td>
                        </tr>

                        {expandedId === r.id && (
                          <tr>
                            <td colSpan={9} className="p-4 bg-[#FBFDFF]">
                              <div className="text-sm text-slate-700 space-y-2">
                                <div><strong>Reason:</strong> {r.reason}</div>
                                <div><strong>Approved/Rejected on:</strong> {r.approved_on || "N/A"}</div>
                                <div><strong>Approver:</strong> {r.approver_name || "N/A"}</div>

                                {Array.isArray(r.leave_entries) && r.leave_entries.length > 0 && (
                                  <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr>
                                          <th className="p-1 text-left">Date</th>
                                          <th className="p-1 text-left">Half Day</th>
                                          <th className="p-1 text-left">Half Type</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {r.leave_entries.map((e, idx) => (
                                          <tr key={idx}>
                                            <td className="p-1">{e.date}</td>
                                            <td className="p-1">{e.is_half ? "Yes" : "No"}</td>
                                            <td className="p-1">{e.half_type || "N/A"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-500">
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
              <p className="text-[11px] md:text-xs text-slate-500">Tip: Use filters to narrow results and export the CSV for reporting.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
