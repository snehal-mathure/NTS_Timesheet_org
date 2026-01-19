// src/pages/ManageHoliday.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../services/AdminDashboard/manageHoliday";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

// ❗ Pagination import
import Pagination from "../components/Pagination";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function ManageHoliday() {
  const [holidays, setHolidays] = useState([]);

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    holiday_type: "RH",
    holiday_desc: "",
  });

  const tableRef = useRef(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = async () => {
    const data = await getHolidays();
    if (data) {
      setHolidays(data);
      setPage(1); // reset to first page on fresh load
    } else {
      setHolidays([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitHoliday = async (e) => {
    e.preventDefault();

    const res = await addHoliday(form);
    if (res?.status === "success") {
      alert("Holiday Added Successfully");
      await loadData();
      setForm({
        start_date: "",
        end_date: "",
        holiday_type: "RH",
        holiday_desc: "",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    const res = await deleteHoliday(id);
    if (res?.status === "success") {
      alert("Holiday deleted");
      await loadData();
    }
  };

  // layout: track sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    const handler = () => {
      setSidebarCollapsed(
        localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
      );
    };

    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  // clamp page when holidays or pageSize change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((holidays?.length || 0) / pageSize));
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidays, pageSize]);

  // compute displayed slice
  const totalItems = holidays?.length || 0;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedHolidays = (holidays || []).slice(startIndex, endIndex);

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#f5f7fb" }}
    >
      {/* FIXED SIDEBAR */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72">
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main
        className={`flex-1 transition-all duration-200 ${mainMarginClass} overflow-y-auto`}
        style={{ minHeight: "100vh" }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          <PageHeader
            title="Manage Holidays"
            subtitle="Add, review and maintain company holiday calendar."
            statLabel="Total Holidays"
            statValue={holidays?.length ?? 0}
          />

          {/* MAIN CARD */}
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[60vh] flex flex-col mt-4">
            <div className="px-6 lg:px-8 py-8 space-y-8 flex-1">
              {/* FORM + QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FORM CARD */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 lg:p-7 shadow-sm">
                  <h3 className="text-[15px] font-semibold mb-1 text-slate-800">
                    Add New Holiday
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Define date range, type and description for the holiday.
                  </p>

                  <form onSubmit={submitHoliday} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Start Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          name="start_date"
                          value={form.start_date}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          End Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={form.end_date}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Type
                        </label>
                        <select
                          name="holiday_type"
                          value={form.holiday_type}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                        >
                          <option value="RH">Restricted</option>
                          <option value="PH">Public</option>
                        </select>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        name="holiday_desc"
                        value={form.holiday_desc}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                        placeholder="Reason / description"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-full text-xs font-medium shadow-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      >
                        Add Holiday
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            start_date: "",
                            end_date: "",
                            holiday_type: "RH",
                            holiday_desc: "",
                          })
                        }
                        className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>

                {/* QUICK ACTIONS */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-7 shadow-sm">
                  <h3 className="text-[15px] font-semibold mb-2 text-slate-800">
                    Quick Actions
                  </h3>
                  <p className="text-[11px] text-slate-600 mb-4">
                    Use these shortcuts to manage your holiday list.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={loadData}
                      className="w-full inline-flex items-center justify-between px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      <span>Refresh List</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                        Sync
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        tableRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                      className="w-full inline-flex items-center justify-between px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      <span>View All Holidays</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                        List
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* HOLIDAY TABLE */}
              <div
                ref={tableRef}
                className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-7 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-slate-800">
                    Holiday List
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {holidays?.length ?? 0} items
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Start Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          End Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-slate-100">
                      {displayedHolidays?.length ? (
                        displayedHolidays.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.start_date}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.end_date}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.holiday_type}
                            </td>
                            <td className="px-4 py-3">{h.holiday_desc}</td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(h.id)}
                                className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 
                                          hover:bg-rose-200 transition flex items-center gap-1"
                                title="Delete Holiday"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-slate-500 text-xs"
                          >
                            No holidays found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
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
              {/* TABLE END */}
            </div>
          </div>
          {/* CARD END */}
        </div>
      </main>
    </div>
  );
}
