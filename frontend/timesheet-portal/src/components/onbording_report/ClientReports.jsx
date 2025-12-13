// src/components/onbording_report/ClientReports.jsx
import React, { useEffect, useState } from "react";
import { getClientReports } from "../../services/AdminDashboard/clientServiceOnboarding";
import PageHeader from "../PageHeader";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function ClientReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // filters
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportData = await getClientReports();
      setData(Array.isArray(reportData) ? reportData : []);
      setPage(1);
    } catch (err) {
      console.error("Error loading client reports:", err);
      setError(err.message || "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.location.href =
      "http://localhost:5000/admin/client_reports?export=true";
  };

  // Filter options
  const clientList = [...new Set(data.map((r) => r.client_name))];
  const deptList = [...new Set(data.map((r) => r.dept_name))];

  // Apply filters
  const filteredData = data.filter((row) => {
    const clientMatch =
      selectedClient === "" || row.client_name === selectedClient;
    const deptMatch = selectedDept === "" || row.dept_name === selectedDept;
    return clientMatch && deptMatch;
  });

  // Pagination after filtering
  const totalItems = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((filteredData.length || 0) / pageSize)
    );
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, pageSize]);

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <div className="max-w-5xl mx-auto">
        <PageHeader title="By Client" subtitle="Onboarding Reports" />

        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
          {/* CARD HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-[#4C6FFF]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 5h4l2 2h8v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M9 13h3M9 16h5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900">
                  Client Resource Allocation
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  View department-wise resource allocation for each client.
                </p>
              </div>
            </div>
          </div>

          {/* FILTER SECTION */}
          <div className="px-6 pt-6">
            <form className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-4 md:px-5 md:py-5 relative">
              {/* RESET + EXPORT */}
              <div className="absolute right-4 top-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient("");
                    setSelectedDept("");
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white 
                  text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={downloadCSV}
                    className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center 
                    hover:bg-emerald-100 transition shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-emerald-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 10l5 5m0 0l5-5m-5 5V4"
                      />
                    </svg>
                  </button>

                  <div
                    className="absolute -top-9 right-0 opacity-0 group-hover:opacity-100 
                    bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md shadow 
                    transition-all duration-200 whitespace-nowrap"
                  >
                    Export CSV
                  </div>
                </div>
              </div>

              <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-3">
                Filter Clients & Departments
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-end">
                {/* Client Filter */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Client
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm"
                  >
                    <option value="">All Clients</option>
                    {clientList.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm"
                  >
                    <option value="">All Departments</option>
                    {deptList.map((d, i) => (
                      <option key={i} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* TABLE SECTION */}
          <div className="px-6 py-6 md:py-7 space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Error: {error}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-slate-600">
                Loading client reports…
              </p>
            ) : filteredData.length === 0 ? (
              <p className="text-sm text-slate-500">
                No client allocation data available for selected filters.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-[#F3F5FF]">
                    <tr className="text-left text-xs font-semibold text-slate-600">
                      <th className="px-4 py-3">Client Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3 text-center">Resource Count</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-t border-[#f1f2fb] hover:bg-[#F8F9FF] transition"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {row.client_name}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.dept_name}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {row.employee_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            {!loading && filteredData.length > 0 && (
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
            )}
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
            <p className="text-[11px] md:text-xs text-slate-500">
              Tip: Use this report to understand how teams are allocated across
              clients & departments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
