// src/components/MyTimesheets.jsx
import React, { useEffect, useState } from "react";
import {
  getMyTimesheets,
  getTimesheetReviewById,
  downloadTimesheetById,
} from "../../services/myTimesheetService";
import { FiEye, FiDownload } from "react-icons/fi";

import TimesheetReviewModal from "./TimesheetReviewModal";
import UserDashboardSidebar from "../UserDashboardSidebar";
import Pagination from "../Pagination"; // ❗ Pagination import

const SIDEBAR_KEY = "td_sidebar_collapsed";

export default function MyTimesheets() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // track collapsed state from localStorage (keeps layout in sync)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  useEffect(() => {
    loadTimesheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1); // reset to first page when filters change
      loadTimesheets();
    }, 300);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    // listen to storage events (other tabs) and custom event (same tab)
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) {
        setSidebarCollapsed(e.newValue === "true");
      }
    };
    const onCustom = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("td_sidebar_change", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("td_sidebar_change", onCustom);
    };
  }, []);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const data = await getMyTimesheets(startDate, endDate);
      setTimesheets(data || []);
      setPage(1); // ensure page reset on fresh load
    } catch (error) {
      console.error("Error loading timesheets:", error);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    loadTimesheets();
  };

  const openTimesheetModal = async (id) => {
    try {
      const res = await getTimesheetReviewById(id);
      if (res && res.success) {
        setModalData(res);
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load timesheet modal:", err);
    }
  };

  // clamp page when timesheets or pageSize change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((timesheets?.length || 0) / pageSize));
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesheets, pageSize]);

  // compute displayed slice
  const totalItems = timesheets.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedTimesheets = timesheets.slice(startIndex, endIndex);

  // compute main margin responsive to sidebarCollapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* Sidebar */}
      <UserDashboardSidebar />

      {/* Main content: independent scroll area */}
      <main
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${mainMarginClass} px-6 md:px-10 py-8`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page header */}
          {/* Gradient Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
            <div
              className="
                w-full 
                bg-gradient-to-r from-[#4C6FFF] to-[#8A7DFF]
                px-6 py-4
                flex items-center gap-4
                text-white
              "
            >
              {/* Icon */}
              <div
                className="
                  w-10 h-10 rounded-xl bg-white/20 
                  border border-white/20
                  backdrop-blur-sm
                  flex items-center justify-center
                "
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 9h16" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>

              <div>
                <h1 className="text-lg font-semibold">My Timesheets</h1>
                <p className="text-xs text-white/90">
                  View, filter, and download your weekly submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Filter card */}
          <div className="bg-white/95 border border-[#e9eefb] rounded-2xl shadow-[0_12px_25px_rgba(15,23,42,0.04)] 
                p-3 flex flex-wrap gap-4 items-center">

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6b7b99" }}>
                Start Date
              </label>
              <input
                type="date"
                className="block w-40 rounded-xl border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(76,111,255,0.06)" }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6b7b99" }}>
                End Date
              </label>
              <input
                type="date"
                className="block w-40 rounded-xl border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(76,111,255,0.06)" }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Reset Button */}
            <div className="ml-auto">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm"
                style={{ color: "#1f3b66" }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white/95 border border-[#e9eefb] rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
            {loading ? (
              <div className="text-center py-10" style={{ color: "#6b7b99" }}>
                Loading...
              </div>
            ) : totalItems === 0 ? (
              <div className="text-center py-10" style={{ color: "#6b7b99" }}>
                No timesheets found.
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs divide-y divide-[#e5e7f5]">
                    <thead className="bg-[#F3F5FF]">
                      <tr className="text-[11px] text-slate-600">
                        <th className="px-4 py-3 text-left font-medium">ID</th>
                        <th className="px-4 py-3 text-left font-medium">Week</th>
                        <th className="px-4 py-3 text-left font-medium">Submitted On</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayedTimesheets.map((t, index) => (
                        <tr
                          key={t.id}
                          className="hover:bg-[#F8F9FF] transition border-b border-slate-100"
                        >
                          <td className="px-4 py-3 font-semibold" style={{ color: "#17408A" }}>
                            {startIndex + index + 1}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {t.week_start_date} → {t.week_end_date}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {t.submitted_date || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                                t.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : t.status === "Submitted"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200
                                            hover:bg-slate-200 transition"
                                onClick={() => openTimesheetModal(t.id)}
                                title="View Employee"
                              >
                                <FiEye size={15} />
                              </button>

                              <button
                                onClick={() => downloadTimesheetById(t.id)}
                                title="Download Timesheet"
                                className="p-2 rounded-xl bg-green-100 text-green-700 border border-green-200 
                                           hover:bg-green-200 transition flex items-center justify-center"
                              >
                                <FiDownload size={16} className="text-green-700" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 md:px-6 py-4 border-t border-[#e5e7f5] bg-white/80">
                  <Pagination
                    totalItems={totalItems}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                    maxButtons={7}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal (rendered outside blur area) */}
      <TimesheetReviewModal
        isOpen={modalOpen}
        data={modalData}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
