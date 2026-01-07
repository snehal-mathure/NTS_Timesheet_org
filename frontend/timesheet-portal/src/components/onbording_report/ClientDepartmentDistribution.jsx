// src/components/onbording_report/ClientDepartmentDistribution.jsx
import React, { useEffect, useState } from "react";
import {
  getClientDepartmentDistribution,
  exportClientDepartmentDistribution,
} from "../../services/AdminDashboard/clientDeptService";

import PageHeader from "../PageHeader";
import Pagination from "../Pagination";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

const ClientDepartmentDistribution = () => {
  const [data, setData] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const handler = () =>
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");

    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  // Load API Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getClientDepartmentDistribution(startDate, endDate);
      setData(res.client_department_counts || []);
      setClientList(res.client_list || []);
      setPage(1);
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load data");
      setData([]);
      setClientList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⭐ FINAL FILTERED DATA (resolved conflict)
  const filteredData = data.filter((row) => {
    const deptMatch =
      selectedDepartment === "" || row.department === selectedDepartment;

    const searchMatch = (row.department || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return deptMatch && searchMatch;
  });

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="By Department Distribution"
          subtitle="Onboarding Reports"
        />

        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-[#4C6FFF]" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M4 7h4l2 2h10v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M9 13h3M9 16h4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900">
                  Department Distribution per Client
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  Analyze how departments are allocated across different clients.
                </p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="px-6 py-6 md:py-7 space-y-6">

            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            {/* FILTER SECTION */}
            <form className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-4 md:px-5 md:py-5 relative overflow-visible">

              {/* RESET + EXPORT */}
              <div className="absolute right-4 top-4 flex items-center gap-3 overflow-visible">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSearchTerm("");
                    setSelectedDepartment("");
                    loadData();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <div className="relative group overflow-visible">
                  <button
                    type="button"
                    onClick={() =>
                      exportClientDepartmentDistribution(startDate, endDate)
                    }
                    className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" />
                    </svg>
                  </button>

                  <div className="absolute -top-9 right-0 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md shadow transition-all duration-200 whitespace-nowrap">
                    Export CSV
                  </div>
                </div>
              </div>

              <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-3">
                Filter Data
              </h3>

              {/* ONE ROW FILTERS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 items-end">

                {/* Start Date */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                      loadData();
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                      loadData();
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm"
                  />
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setPage(1);
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm"
                  >
                    <option value="">All Departments</option>
                    {[...new Set(data.map((d) => d.department))].map((dept, i) => (
                      <option key={i} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </form>
            

            {/* Table */}
            {loading ? (
              <p className="text-sm text-slate-600">Loading distribution data…</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                      <tr className="text-left text-xs font-semibold text-slate-600">
                        <th className="px-4 py-3 text-left">Department</th>

                        {clientList.map((client, i) => (
                          <th key={i} className="px-4 py-3 text-center">
                            {client}
                          </th>
                        ))}

                        <th className="px-4 py-3 text-center">
                          Non-Billable
                        </th>

                        <th className="px-4 py-3 text-center">
                          Total Count
                        </th>
                      </tr>
                    </thead>

                    <tbody className="text-slate-700">
                      {filteredData.length > 0 ? (
                        filteredData.map((row, index) => {
                          const totalBillable = clientList.reduce(
                            (sum, client) => sum + (row[client] || 0),
                            0
                          );

                          return (
                            <tr
                              key={index}
                              className="hover:bg-[#F8F9FF] transition-colors border-t border-[#f1f2fb]"
                            >
                              <td className="p-4 font-medium text-slate-800">
                                {row.department}
                              </td>

                              {clientList.map((client, i) => (
                                <td key={i} className="p-4 text-center">
                                  {row[client] || 0}
                                </td>
                              ))}

                              <td className="p-4 text-center">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                                  {row.non_billable_count}
                                </span>
                              </td>

                              <td className="p-4 text-center">
                                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  {totalBillable}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={clientList.length + 3}
                            className="p-6 text-center text-slate-500 text-sm"
                          >
                            No data available for selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
            <p className="text-[11px] md:text-xs text-slate-500">
              Tip: Use this matrix to compare department utilization across different clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDepartmentDistribution;
