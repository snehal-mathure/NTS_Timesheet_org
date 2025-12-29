import React, { useEffect, useState } from "react";
import {
  getWorkforceSkillDistribution,
  exportWorkforceSkillDistribution,
} from "../../services/AdminDashboard/WorkforceSkillDistribution";
import { useNavigate } from "react-router-dom";
import PageHeader from "../PageHeader";
import Pagination from "../Pagination";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

const WorkforceSkillDistribution = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const [selectedDept, setSelectedDept] = useState("");
  // const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [billableFilter, setBillableFilter] = useState("all");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ---------------- Sidebar Sync ---------------- */
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

  /* ---------------- Load Data ---------------- */
  const loadData = async () => {
    try {
      const response = await getWorkforceSkillDistribution(experienceFilter);

      // ✅ HANDLE BOTH CASES
      const apiData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setData(apiData);
      setPage(1);
    } catch (err) {
      console.error("API Error:", err);
      setData([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [experienceFilter]);

  /* ---------------- Dropdown Lists ---------------- */
  const departmentList = [
    ...new Set(data.map((d) => d.department).filter(Boolean)),
  ];

  // const skillList = [
  //   ...new Set(data.map((d) => d.core_skill).filter(Boolean)),
  // ];

  const jobRoleList = [
    ...new Set(data.map((d) => d.job_role).filter(Boolean)),
  ];

  const filteredData = data.filter((row) => {
    const deptMatch =
      selectedDept === "" || row.department === selectedDept;

    const jobRoleMatch =
      selectedJobRole === "" || row.job_role === selectedJobRole;

    let billableMatch = true;
    if (billableFilter === "billable") {
      billableMatch = row.billable_count > 0;
    }
    if (billableFilter === "non-billable") {
      billableMatch = row.non_billable_count > 0;
    }

    return deptMatch && jobRoleMatch && billableMatch;
  });

  const totalItems = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const displayedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Skill-Based Workforce Overview"
          subtitle="Onboarding Reports"
        />

        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Workforce Skill Distribution
              </h2>
              <p className="text-sm text-slate-500">
                Department & core-skill wise workforce overview
              </p>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6 space-y-6">

            {/* FILTERS */}
            <div className="rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-5 py-5 relative">

              {/* RESET + EXPORT */}
              <div className="absolute right-4 top-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedJobRole("");
                    setExperienceFilter("all");
                    setBillableFilter("all");
                    setPage(1);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

                <button
                    type="button"
                    onClick={() => exportWorkforceSkillDistribution(experienceFilter)}
                    className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm"
                    title="Export CSV"
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

              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Filter Data
              </h3>

              {/* 🔥 LABELLED FILTERS (LIKE DepartmentBillability.jsx) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Department */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setPage(1);
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="">All Departments</option>
                    {departmentList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Job Role
                  </label>
                  <select
                    value={selectedJobRole}
                    onChange={(e) => {
                      setSelectedJobRole(e.target.value);
                      setPage(1);
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="">All Job Roles</option>
                    {jobRoleList.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Experience
                  </label>
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

                {/* Billability */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-600">
                    Billability
                  </label>
                  <select
                    value={billableFilter}
                    onChange={(e) => {
                      setBillableFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border border-[#d9dcef] bg-white rounded-2xl px-3 py-2 text-sm w-full"
                  >
                    <option value="all">All</option>
                    <option value="billable">Billable</option>
                    <option value="non-billable">Non-Billable</option>
                  </select>
                </div>

              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Job Role</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-left">Skill Details</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.length > 0 ? (
                    displayedData.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-[#F8F9FF] cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/onboarding-reports/workforce-employees?department=${encodeURIComponent(
                              row.department
                            )}&job_role=${encodeURIComponent(
                              row.job_role
                            )}&experience=${experienceFilter}&billable=${billableFilter}`
                          )
                        }
                      >
                        <td className="px-4 py-3 font-semibold">
                          {row.department}
                        </td>
                        <td className="px-4 py-3">{row.job_role}</td>
                        {/* <td className="px-4 py-3 text-center font-semibold">
                          {row.total_count}
                        </td> */}
                        <td className="px-4 py-3 text-center font-semibold">
                          {billableFilter === "billable"
                            ? row.billable_count
                            : billableFilter === "non-billable"
                            ? row.non_billable_count
                            : row.total_count}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {row.skill_details || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-500">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              totalItems={totalItems}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceSkillDistribution;
