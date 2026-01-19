// src/pages/UtilizationReport.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

import {
  getUtilizationReport,
  getFiltersList,
  getCsvDownloadUrl,
} from "../services/AdminDashboard/utilizationService";

// Pagination component
import Pagination from "../components/Pagination";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";
const accent = "#4C6FFF";

export default function UtilizationReport() {
  const [filters, setFilters] = useState({
    department: "All",
    client: "All",
    start_date: "",
    end_date: "",
  });

  const [departments, setDepartments] = useState(["All"]);
  const [clients, setClients] = useState(["All"]);
  const [data, setData] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // layout: track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };

    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  // Load dropdown options
  const loadDropdowns = async () => {
    setLoadingDropdowns(true);
    try {
      const res = await getFiltersList();
      if (res?.status === "success") {
        setDepartments(["All", ...res.departments_list.map((d) => d.dept_name)]);
        setClients([
          "All",
          ...res.clients_list.map((c) => c.client_name.split("(")[0].trim()),
        ]);
      }
    } catch (err) {
      console.error("Dropdown load error:", err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Fetch table data
  const fetchData = async () => {
    if (!filters.start_date || !filters.end_date) {
      setData([]);
      return;
    }
    setLoadingData(true);
    try {
      const res = await getUtilizationReport(filters);
      if (res?.status === "success" && Array.isArray(res.data)) {
        setData(res.data);
        setPage(1); // reset to first page on fresh load
      } else {
        setData([]);
        setPage(1);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
      setPage(1);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department, filters.client, filters.start_date, filters.end_date]);

  // clamp page when data or pageSize change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((data?.length || 0) / pageSize));
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, pageSize]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      department: "All",
      client: "All",
      start_date: "",
      end_date: "",
    });
    setData([]);
    setPage(1);
  };

  const downloadCSV = async () => {
    try {
      const url = getCsvDownloadUrl(filters);
      const res = await fetch(url, { method: "GET", credentials: "include" });
      const csvText = await res.text();
      if (!csvText) return alert("CSV unavailable");

      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `utilization_${filters.start_date || "all"}_${filters.end_date || "all"}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed");
    }
  };

  // main margin classes mirror sidebar widths: collapsed -> md:ml-20 (icons only); expanded -> md:ml-72
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  // compute displayed slice for current page
  const totalItems = data.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedData = data.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR (independent scroll) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 md:w-72 lg:w-72">
        <Sidebar />
      </aside>

      <div className="md:hidden">
        {/* mobile handled inside pages/components */}
      </div>

      <main
        className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-8 py-6 md:py-6`}
        style={{ minHeight: "100vh" }}
      >
        <div className="max-w-6xl mx-auto space-y-5 mt-4">

          <PageHeader
            section="Reports"
            title="Utilization Report"
            description="View employee billable & non-billable utilization."
          />

          {/* Filters Card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl p-4 md:p-6 shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-md md:text-lg font-semibold text-slate-800 mb-3">
                  Filters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div>
                    <label className="font-medium text-xs md:text-sm text-slate-700">Department</label>
                    <select
                      name="department"
                      value={filters.department}
                      onChange={handleChange}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-xs md:text-sm"
                    >
                      {departments.map((d, idx) => (
                        <option key={idx} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-xs md:text-sm text-slate-700">Client</label>
                    <select
                      name="client"
                      value={filters.client}
                      onChange={handleChange}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-xs md:text-sm"
                    >
                      {clients.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-xs md:text-sm text-slate-700">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={filters.start_date}
                      onChange={handleChange}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-xs md:text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-xs md:text-sm text-slate-700">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={filters.end_date}
                      onChange={handleChange}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-xs md:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Actions (inline, compact) */}
              <div className="absolute right-4 top-4 flex items-center gap-3">
                  <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={downloadCSV}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
                  title="Download CSV"
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
                <div className="text-xs text-slate-500">
                  {loadingDropdowns ? "Loading options..." : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] overflow-hidden">

            {/* Header Bar */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#e5e7f5] bg-white/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm md:text-lg font-semibold text-slate-800">
                  Results <span className="text-slate-500 font-medium">({totalItems} record(s) found)</span>
                </h3>
                <div className="text-xs text-slate-500 mt-1">{loadingData ? "Fetching data..." : ""}</div>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm divide-y divide-[#e5e7f5]">
                <thead className="bg-[#F3F5FF] text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-left">Employee</th>
                    <th className="px-3 py-2 font-semibold text-left">Department</th>
                    <th className="px-3 py-2 font-semibold text-left">Client</th>
                    <th className="px-3 py-2 font-semibold text-left">Projects</th>
                    <th className="px-3 py-2 font-semibold text-left">Client Start - End</th>
                    <th className="px-3 py-2 font-semibold text-left">Billed Hrs</th>
                    <th className="px-3 py-2 font-semibold text-left">Non-Billable Hrs</th>
                    <th className="px-3 py-2 font-semibold text-left">Billable Hrs</th>
                    <th className="px-3 py-2 font-semibold text-left">Billed %</th>
                    <th className="px-3 py-2 font-semibold text-left">Non-Billed %</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedData.length > 0 ? (
                    displayedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FBFBFF] transition border-b">
                        <td className="px-3 py-2 max-w-[160px] break-words">{row.employee_name || "-"}</td>
                        <td className="px-3 py-2 max-w-[120px] break-words">{row.department || "-"}</td>
                        <td className="px-3 py-2 max-w-[160px] break-words">{row.client_name || "-"}</td>
                        <td className="px-3 py-2 max-w-[220px] break-words">{Array.isArray(row.projects) ? row.projects.join(", ") : (row.projects || "-")}</td>
                        <td className="px-3 py-2 max-w-[140px] break-words">{row.client_start_end || "-"}</td>
                        <td className="px-3 py-2 text-right">{row.billed_hours ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{row.non_billable_hours ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{row.billable_hours ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{row.billed_utilization ?? "-"}%</td>
                        <td className="px-3 py-2 text-right">{row.non_billable_utilization ?? "-"}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="p-6 text-center text-slate-500 text-sm">
                        No Records Found
                      </td>
                    </tr>
                  )}
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
                pageSizeOptions={[10, 20, 50, 100]}
                maxButtons={7}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}




