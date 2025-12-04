// src/components/onbording_report/ClientDepartmentDistribution.jsx
import React, { useEffect, useState } from "react";
import {
  getClientDepartmentDistribution,
  exportClientDepartmentDistribution,
} from "../../services/AdminDashboard/clientDeptService";

const ClientDepartmentDistribution = () => {
  const [data, setData] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getClientDepartmentDistribution(startDate, endDate);

      setData(res.client_department_counts || []);
      setClientList(res.client_list || []);
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

  // Search Filter
  const filteredData = data.filter((row) =>
    (row.department || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Heading – consistent with other onboarding pages */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          Onboarding Reports
        </p>
        <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900">
          Client-wise Department Distribution
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

          <button
            onClick={() =>
              exportClientDepartmentDistribution(startDate, endDate)
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.35)] bg-emerald-500 hover:bg-emerald-600"
          >
            <span className="text-sm">⬇</span>
            Export CSV
          </button>
        </div>

        {/* Card body */}
        <div className="px-6 py-6 md:py-7 space-y-6">
          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {/* Filter section – styled like DepartmentBillability */}
          <form
            onSubmit={handleFilter}
            className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-4 md:px-5 md:py-5"
          >
            <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-3">
              Filter by Date Range
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                  Start Date
                </label>
                <input
                  type="date"
                  className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                  End Date
                </label>
                <input
                  type="date"
                  className="border border-[#d9dcef] bg-white rounded-2xl w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-[#4C6FFF] text-white text-xs md:text-sm shadow-md hover:bg-[#3f57d9]"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    loadData();
                  }}
                  className="px-4 py-2.5 rounded-2xl border border-[#e0e4ff] bg-white text-xs md:text-sm hover:bg-[#f3f5ff]"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search department..."
              className="border border-[#d9dcef] bg-[#F8F9FF] rounded-2xl px-3 py-2 text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-sm text-slate-600">Loading distribution data…</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF]">
                  <tr className="text-left text-xs font-semibold text-slate-600">
                    <th className="p-4 border-b font-semibold">Department</th>

                    {clientList.map((client, i) => (
                      <th
                        key={i}
                        className="p-4 border-b text-center font-semibold"
                      >
                        {client}
                      </th>
                    ))}

                    <th className="p-4 border-b text-center font-semibold">
                      Non-Billable
                    </th>

                    <th className="p-4 border-b text-center font-semibold">
                      Total Count
                    </th>
                  </tr>
                </thead>

                <tbody className="text-slate-700">
                  {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
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
                            {row.total_count}
                          </span>
                        </td>
                      </tr>
                    ))
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
          )}
        </div>

        {/* Card footer */}
        <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
          <p className="text-[11px] md:text-xs text-slate-500">
            Tip: Use this matrix to compare department utilization across
            different clients and identify imbalances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientDepartmentDistribution;
