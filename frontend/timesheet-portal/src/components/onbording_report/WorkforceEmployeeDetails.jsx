import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../PageHeader";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import {
  getWorkforceEmployeeDetails,
  exportWorkforceEmployeeDetails,
} from "../../services/AdminDashboard/workforceEmployeeDetails";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

const WorkforceEmployeeDetails = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [billableCount, setBillableCount] = useState(0);
  const [nonBillableCount, setNonBillableCount] = useState(0);


  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  /* ---------------- URL PARAMS ---------------- */
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const department = params.get("department");
  const jobRole = params.get("job_role");
  const coreSkill = params.get("core_skill");
  const experience = params.get("experience");
  const billable = params.get("billable");

  const navigate = useNavigate();

  const backToList = () => {
    navigate(-1); // go back to previous page
  };


  /* ---------------- Sidebar Sync ---------------- */
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

  /* ---------------- Load Employees ---------------- */
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await getWorkforceEmployeeDetails({
          department,
          job_role: jobRole,        // ✅ ADD THIS
          core_skill: coreSkill,
          experience,
          billable,
        });

        // setData(Array.isArray(res.data) ? res.data : []);
        setData(res.data || []);
        setBillableCount(res.billable_count || 0);
        setNonBillableCount(res.non_billable_count || 0);

        setPage(1);
      } catch (err) {
        console.error("Employee API error:", err);
        setData([]);
      }
    };

    loadEmployees();
  }, [location.search]);

  /* ---------------- CSV EXPORT ---------------- */
  const downloadCSV = async () => {
    try {
      const response = await exportWorkforceEmployeeDetails({
        department,
        job_role: jobRole,        // ✅ ADD THIS
        core_skill: coreSkill,
        experience,
        billable,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "workforce_employee_details.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV export error:", err);
    }
  };

  /* ---------------- Pagination ---------------- */
  const totalItems = data.length;
  const startIndex = (page - 1) * pageSize;
  const displayedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Employee Details"
          subtitle={`${department || "All Departments"} • ${
            coreSkill || "All Core Skills"
          }`}
        />

        {/* CARD */}
        <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
            <div className="flex items-center gap-3">
              
              {/* BACK BUTTON */}
              <button
                onClick={backToList}
                className="inline-flex items-center justify-center 
                          w-9 h-9 bg-white hover:bg-slate-100 
                          rounded-xl border border-slate-300 transition"
                title="Back"
              >
                <FiArrowLeft size={16} className="text-slate-700" />
              </button>

              {/* TITLE */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Employee Details
                </h2>
                <p className="text-sm text-slate-500">
                  Filtered workforce employee listing
                </p>
              </div>
            </div>

            {/* EXPORT */}
            <button
              onClick={downloadCSV}
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


          {/* BODY */}
          <div className="px-6 py-6 space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-[#e1e4f3] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F3F5FF] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Designation</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-center">
                      Total Experience (Years)
                    </th>
                    <th className="px-4 py-3 text-left">Skill Set</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.length > 0 ? (
                    displayedData.map((emp, i) => (
                      <tr key={i} className="border-t border-[#f1f2fb] hover:bg-[#F8F9FF]">
                        <td className="px-4 py-3">{emp.empid}</td>
                        <td className="px-4 py-3 font-semibold">
                          {emp.employee_name}
                        </td>
                        <td className="px-4 py-3">
                          {emp.designation || "-"}
                        </td>
                        <td className="px-4 py-3">{emp.email}</td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {emp.total_experience_years?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {emp.skill_details || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-500">
                        No employees found
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

export default WorkforceEmployeeDetails;


