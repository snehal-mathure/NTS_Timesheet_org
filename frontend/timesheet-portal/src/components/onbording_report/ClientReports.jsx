// src/components/onbording_report/ClientReports.jsx
import React, { useEffect, useState } from "react";
import { getClientReports } from "../../services/AdminDashboard/clientServiceOnboarding";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed"; // SAME AS OTHER PAGES

export default function ClientReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⭐ Sidebar collapse margin logic (IDENTICAL to AddClient.jsx)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
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

  // EXACT same margin logic used in AddClient.jsx
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportData = await getClientReports();
      setData(Array.isArray(reportData) ? reportData : []);
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

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading – same as other onboarding pages */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Onboarding Reports
          </p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900">
            Client Reports
          </h1>
        </div>

        {/* Main card */}
        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
          {/* Card header */}
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

            <button
              onClick={downloadCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.35)] bg-emerald-500 hover:bg-emerald-600"
            >
              <span className="text-sm">⬇</span>
              Export CSV
            </button>
          </div>

          {/* Card body */}
          <div className="px-6 py-6 md:py-7 space-y-4">
            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Error: {error}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <p className="text-sm text-slate-600">Loading client reports…</p>
            ) : data.length === 0 ? (
              <p className="text-sm text-slate-500">
                No client allocation data available.
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
                    {data.map((row, index) => (
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
          </div>

          {/* Card footer */}
          <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
            <p className="text-[11px] md:text-xs text-slate-500">
              Tip: Use this report to understand how your teams are allocated across different clients and departments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
