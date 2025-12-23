// src/pages/EmpLeaveDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import empLeaveDashboardService from "../services/UserDashboard/empLeaveDashboardService ";
import { Link } from "react-router-dom";
import PageHeader from "./PageHeader";
import UserDashboardSidebar from "./UserDashboardSidebar";
import { FiTrash2 } from "react-icons/fi";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function EmpLeaveDashboard() {
  const [balance, setBalance] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [filterLeaveType, setFilterLeaveType] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const tableRef = useRef(null);

  // track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    // update layout if sidebar toggled elsewhere (same-tab event)
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };

    // storage event covers other tabs; custom event covers same-tab toggles
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await empLeaveDashboardService.getDashboard();
      setBalance(res.balance || {});
      setLeaves(res.leaves || []);
      setHolidays(res.holidays || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const typeMatch =
      filterLeaveType === "all" ||
      (leave.leave_type || "").toLowerCase() === filterLeaveType.toLowerCase();

    const startMatch = !filterStartDate || leave.from_date >= filterStartDate;
    const endMatch = !filterEndDate || leave.to_date <= filterEndDate;

    return typeMatch && startMatch && endMatch;
  });

  const resetFilters = () => {
    setFilterLeaveType("all");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave?")) return;

    try {
      const res = await empLeaveDashboardService.cancelLeave(leaveId);

      if (res?.success) {
        alert("Leave cancelled successfully.");
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status: "Canceled" } : l))
        );
      } else {
        alert(res?.error || "Failed to cancel leave");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel leave");
    }
  };

  // compute main margin:
  // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
  // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  return (
    <div className="flex min-h-screen bg-[#F5F7FF]">
      {/* FIXED SIDEBAR */}
      <UserDashboardSidebar />

      {/* MAIN CONTENT (scrollable) */}
      <main className={`flex-1 overflow-y-auto px-6 md:px-12 py-8 transition-all duration-200 ${mainMarginClass}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page header */}
          <PageHeader
            section="Leaves"
            title="My Leaves"
            description="View your leave balances, history and upcoming holidays."
          />

          {/* CARD WRAPPER */}
          <div className="bg-white/95 border border-[#e9eefb] rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[#eef2ff] bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#4C6FFF]">
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 2.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M16 2.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">Leave Overview</h2>
                  <p className="text-sm text-slate-500">Track balances, applied leaves and upcoming holidays.</p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Total Leaves Applied</span>
                <span className="text-2xl font-bold text-slate-900">{leaves?.length ?? 0}</span>
              </div>
            </div>

            {/* INNER BODY */}
            <div className="p-6 md:p-8 space-y-6">
              {/* BALANCES */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {Object.entries(balance).length ? (
                    Object.entries(balance).map(([type, count]) => (
                      <div
                        key={type}
                        // className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center"
                      >
                        <h4 className="text-sm font-semibold text-slate-600 mb-2">
                          {type.replace("_", " ").toUpperCase()}
                        </h4>
                        <div className="text-3xl font-semibold text-slate-900">{count}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-6 text-slate-500 text-sm">
                      No leave balance data found.
                    </div>
                  )}
                </div>
              </div>

              {/* LEAVE HISTORY */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                {/* Header */}
                <div className="flex justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Leave History</h3>
                    <p className="text-xs text-slate-500 mt-1">{filteredLeaves.length} item(s)</p>
                  </div>

                  <Link
                    to="/applyleave"
                    className="
                      inline-flex items-center gap-2
                      px-2 py-0              /* ✅ same as button */
                      rounded-2xl
                      text-xs font-semibold  /* match font weight */
                      text-white
                    "
                    style={{ background: "linear-gradient(135deg,#4C6FFF,#6C5CE7)" }}
                  >
                    Apply for Leave
                  </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700">Leave Type:</label>
                    <select
                      value={filterLeaveType}
                      onChange={(e) => setFilterLeaveType(e.target.value)}
                      className="border border-slate-200 rounded-full px-3 py-1 text-xs bg-[#F8F9FF]"
                    >
                      <option value="all">All</option>
                      {Array.from(new Set(leaves.map((l) => l.leave_type)))
                        .filter(Boolean)
                        .map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700">Start:</label>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="border border-slate-200 rounded-full px-3 py-1 text-xs bg-[#F8F9FF]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700">End:</label>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="border border-slate-200 rounded-full px-3 py-1 text-xs bg-[#F8F9FF]"
                    />
                  </div>

                  {/* ✅ FIXED RESET BUTTON */}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>

                {/* LEAVE TABLE */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-600">Type</th>
                        <th className="px-4 py-3 text-left text-slate-600">From</th>
                        <th className="px-4 py-3 text-left text-slate-600">To</th>
                        <th className="px-4 py-3 text-left text-slate-600">Reason</th>
                        <th className="px-4 py-3 text-left text-slate-600">Applied On</th>
                        <th className="px-4 py-3 text-left text-slate-600">Status</th>
                        <th className="px-4 py-3 text-left text-slate-600">Comments</th>
                        <th className="px-4 py-3 text-left text-slate-600">Action</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredLeaves.length ? (
                        filteredLeaves.map((leave) => {
                          const status = (leave.status || "").toLowerCase();
                          const isActionable =
                            status !== "approved" &&
                            status !== "canceled" &&
                            status !== "cancelled";

                          return (
                            <tr key={leave.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">{leave.leave_type || "-"}</td>
                              <td className="px-4 py-3">{leave.from_date || "-"}</td>
                              <td className="px-4 py-3">{leave.to_date || "-"}</td>
                              <td className="px-4 py-3 max-w-[12rem] truncate">
                                {leave.reason || "-"}
                              </td>
                              <td className="px-4 py-3">{leave.applied_on || "-"}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`font-semibold ${
                                    status === "pending"
                                      ? "text-yellow-600"
                                      : status === "approved"
                                      ? "text-green-600"
                                      : status.includes("cancel")
                                      ? "text-gray-500"
                                      : "text-red-600"
                                  }`}
                                >
                                  {leave.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 max-w-[12rem] truncate">
                                {leave.comments || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {isActionable ? (
                                  <button
                                    onClick={() => handleCancelLeave(leave.id)}
                                    className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition"
                                    title="Cancel Leave"
                                  >
                                    <FiTrash2 size={15} />
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>
                            No leaves found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HOLIDAYS */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Upcoming Holidays</h3>
                  <span className="text-xs text-slate-500">{holidays?.length ?? 0} item(s)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Holiday</th>
                        <th className="px-3 py-2 text-left">Description</th>
                      </tr>
                    </thead>

                    <tbody>
                      {holidays.length ? (
                        holidays.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">{h.start_date}</td>
                            <td className="px-3 py-2">{h.holiday_type}</td>
                            <td className="px-3 py-2">{h.holiday_desc}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                            No holidays found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  <strong>Note:</strong> Holidays shown according to company calendar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
