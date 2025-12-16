// src/components/onbording_report/DepartmentBillability.jsx
import React, { useEffect, useState } from "react";
import {
  getDepartmentBillability,
  exportDepartmentBillability,
} from "../../services/AdminDashboard/departmentService";
import PageHeader from "../PageHeader";
import Pagination from "../Pagination";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

const DepartmentBillability = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Experience filter
  const [experienceFilter, setExperienceFilter] = useState("all");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  const loadData = async () => {
    try {
      const response = await getDepartmentBillability();
      setData(response.data || []);
      setPage(1);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departmentList = [...new Set(data.map((d) => d.department))];

  // EXPERIENCE-BASED VALUE PICKER
  const getValues = (row) => {
    if (experienceFilter === "fresher") {
      return {
        billable: row.fresher_billable ?? 0,
        nonBillable: row.fresher_non_billable ?? 0,
        total: row.fresher_count ?? 0,
      };
    }
    if (experienceFilter === "experienced") {
      return {
        billable: row.experienced_billable ?? 0,
        nonBillable: row.experienced_non_billable ?? 0,
        total: row.experienced_count ?? 0,
      };
    }

    return {
      billable: row.billable_count ?? 0,
      nonBillable: row.non_billable_count ?? 0,
      total: row.total_employees ?? 0,
    };
  };

  // FILTERED DATA
  const filteredData = data.filter((row) => {
    const dept = row.department?.toLowerCase() || "";

    const searchMatch = dept.includes(searchTerm.toLowerCase());
    const deptMatch = selectedDept === "" || row.department === selectedDept;

    let experienceMatch = true;
    if (experienceFilter === "fresher") {
      experienceMatch = Number(row.fresher_count) > 0;
    }
    if (experienceFilter === "experienced") {
      experienceMatch = Number(row.experienced_count) > 0;
    }

    return searchMatch && deptMatch && experienceMatch;
  });

  // PAGINATION DATA
  const totalItems = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const displayedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <div className="max-w-5xl mx-auto">
        <PageHeader title="By Department" subtitle="Onboarding Reports" />

        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* CARD HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-[#4C6FFF]" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7a2 2 0 012-2h2l1.5 2H18a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path d="M8 11h4M8 15h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900">
                  Billability by Department
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  View billable vs non-billable headcount per department.
                </p>
              </div>
            </div>
          </div>

          {/* CARD BODY */}
          <div className="px-6 py-6 md:py-7 space-y-6">

            {/* FILTER SECTION */}
            <form className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-4 py-5 md:px-5 relative">

              {/* RESET + EXPORT */}
              <div className="absolute right-4 top-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSelectedDept("");
                    setExperienceFilter("all");
                    setSearchTerm("");
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => exportDepartmentBillability(startDate, endDate, experienceFilter)}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
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
              </div>

              <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-3">
                Filter Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Start Date */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  />
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setPage(1);
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="">All Departments</option>
                    {departmentList.map((dept, i) => (
                      <option key={i} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Filter */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">Experience</label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => {
                      setExperienceFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="all">All</option>
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </div>

              </div>
            </form>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF]">
                  <tr className="text-left text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-center">Billable</th>
                    <th className="px-4 py-3 text-center">Non-Billable</th>
                    <th className="px-4 py-3 text-center">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedData.length > 0 ? (
                    displayedData.map((row, i) => {
                      const { billable, nonBillable, total } = getValues(row);

                      return (
                        <tr key={i} className="border-t border-[#f1f2fb] hover:bg-[#F8F9FF] transition">
                          <td className="px-4 py-3 text-slate-800">{row.department}</td>
                          <td className="px-4 py-3 text-center">{billable}</td>
                          <td className="px-4 py-3 text-center">{nonBillable}</td>
                          <td className="px-4 py-3 text-center font-semibold">{total}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-5 text-center text-slate-500">
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <Pagination
              totalItems={totalItems}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              maxButtons={7}
            />

          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
            <p className="text-[11px] md:text-xs text-slate-500">
              Tip: Use the filters to refine your department billability insights.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DepartmentBillability;
