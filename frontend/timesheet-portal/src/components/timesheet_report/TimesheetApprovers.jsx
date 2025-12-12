// // src/pages/TimesheetApprovers.jsx
// import React, { useEffect, useState } from "react";
// import {
//   fetchTimesheetApprovers,
//   downloadCSVApprovers,
// } from "../../services/AdminDashboard/TimesheetApproversService";
// import axiosInstance from "../../services/AdminDashboard/axiosInstance";
// import { useNavigate, NavLink, Link } from "react-router-dom";
// import {
//   FiFileText,
//   FiUserCheck,
//   FiAlertCircle,
//   FiLogOut,
//   FiArrowLeft,
// } from "react-icons/fi";
// import PageHeader from "../PageHeader";

// export default function TimesheetApprovers() {
//   const [departments, setDepartments] = useState([]);
//   const [approversList, setApproversList] = useState([]);
//   const [data, setData] = useState([]);

//   const navigate = useNavigate();

//   const [filters, setFilters] = useState({
//     department: "",
//     approver: "",
//   });

//   const handleLogout = async () => {
//     try {
//       const res = await axiosInstance.get("/logout", {
//         withCredentials: true,
//       });
//       if (res.data.status === "success") {
//         sessionStorage.clear();
//         localStorage.clear();
//         navigate("/login");
//       }
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadData = async () => {
//     try {
//       const res = await fetchTimesheetApprovers(filters);
//       setData(res.data.results || []);
//       setDepartments(res.data.departments || []);
//       setApproversList(res.data.approvers || []);
//     } catch (error) {
//       console.error("Error loading data:", error);
//     }
//   };

//   const handleFilter = (e) => {
//     e.preventDefault();
//     loadData();
//   };

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const resetFilters = () => {
//     setFilters({
//       department: "",
//       approver: "",
//     });
//     loadData();
//   };

//   const recordCount = data.length;

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       {/* Sidebar – SAME as TimesheetReports */}
//       <aside className="hidden md:flex md:flex-col w-64 bg-white/90 backdrop-blur border-r border-slate-200 shadow-sm">
//         {/* Brand / header */}
//         <div className="px-6 py-5 border-b border-slate-200">
//           <div className="flex items-center gap-3">
//             <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
//               <Link to="/dashboard">
//                 <FiArrowLeft className="text-lg" />
//               </Link>
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-800">
//                 Timesheet Management
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Nav links */}
//         <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
//           <NavLink
//             to="/timesheet-reports"
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive
//                 ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-100"
//                 : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`
//             }
//           >
//             <FiFileText className="text-base" />
//             <span>Timesheet Reports</span>
//           </NavLink>

//           <NavLink
//             to="/timesheet-approvers"
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive
//                 ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-100"
//                 : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`
//             }
//           >
//             <FiUserCheck className="text-base" />
//             <span>Timesheet Approvers</span>
//           </NavLink>

//           <NavLink
//             to="/timesheet-defaulters"
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive
//                 ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-100"
//                 : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`
//             }
//           >
//             <FiAlertCircle className="text-base" />
//             <span>Timesheet Defaulters</span>
//           </NavLink>
//         </nav>

//         {/* Logout */}
//         <div className="px-4 py-4 border-t border-slate-200">
//           <button
//             onClick={handleLogout}
//             className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
//           >
//             <FiLogOut className="text-base" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* MAIN – same container, spacing, scroll as TimesheetReports */}
//       <main className="flex-1 h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* Page Header */}
//           <PageHeader
//             title="Timesheet Approvers"
//             subtitle="View and manage approver mapping by department and employee."
//             statLabel="Total Records"
//             statValue={recordCount}
//             icon={<FiUserCheck className="text-white w-6 h-6" />}
//           />

//           {/* Filters + Table Wrapper */}
//           <div className="space-y-6">
//             {/* Filters card – same style as Reports */}
//             <section className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 md:px-8 py-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-sm font-semibold text-slate-900">
//                   Filters
//                 </h2>
//                 <button
//                   type="button"
//                   onClick={resetFilters}
//                   className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
//                 >
//                   Reset
//                 </button>
//               </div>

//               <form onSubmit={handleFilter}>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//                   <div>
//                     <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
//                       Department
//                     </p>
//                     <select
//                       name="department"
//                       value={filters.department}
//                       onChange={handleChange}
//                       className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="">All Departments</option>
//                       {departments.map((dept, i) => (
//                         <option key={i} value={dept}>
//                           {dept}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
//                       Approver
//                     </p>
//                     <select
//                       name="approver"
//                       value={filters.approver}
//                       onChange={handleChange}
//                       className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="">All Approvers</option>
//                       {approversList.map((a, i) => (
//                         <option key={i} value={a}>
//                           {a}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <button
//                     type="submit"
//                     className="bg-[#4C6FFF] text-white rounded-2xl px-6 py-2 text-xs font-semibold shadow hover:bg-[#3e54d4]"
//                   >
//                     Apply Filters
//                   </button>
//                 </div>
//               </form>
//             </section>

//             {/* Summary + CSV */}
//             <div className="flex flex-col md:flex-row justify-between items-center gap-3">
//               <p className="text-xs text-slate-600">
//                 Showing{" "}
//                 <span className="font-semibold text-slate-900">
//                   {recordCount}
//                 </span>{" "}
//                 records
//               </p>

//               <a
//                 href={downloadCSVApprovers(
//                   filters.department,
//                   filters.approver
//                 )}
//                 className="border border-emerald-400 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-100"
//               >
//                 ⬇️ Download CSV
//               </a>
//             </div>

//             {/* Table – same visual family as Reports table */}
//             <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//               <table className="w-full text-xs">
//                 <thead className="bg-[#F3F5FF] text-slate-600 text-[11px] uppercase tracking-wide">
//                   <tr>
//                     <th className="px-4 py-3 text-left">Employee ID</th>
//                     <th className="px-4 py-3 text-left">Employee Name</th>
//                     <th className="px-4 py-3 text-left">Approver ID</th>
//                     <th className="px-4 py-3 text-left">Approver Name</th>
//                     <th className="px-4 py-3 text-left">Department</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.length > 0 ? (
//                     data.map((row, index) => (
//                       <tr
//                         key={index}
//                         className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-slate-100"
//                       >
//                         <td className="px-4 py-3">{row.employee_id}</td>
//                         <td className="px-4 py-3">{row.employee_name}</td>
//                         <td className="px-4 py-3">{row.approver_id || "-"}</td>
//                         <td className="px-4 py-3">{row.approver_name || "-"}</td>
//                         <td className="px-4 py-3">{row.department}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="text-center py-6 text-slate-500 text-xs"
//                       >
//                         No records found for the selected filters.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </section>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// src/pages/TimesheetApprovers.jsx
import React, { useEffect, useState } from "react";
import {
  fetchTimesheetApprovers,
  downloadCSVApprovers,
} from "../../services/AdminDashboard/TimesheetApproversService";
import axiosInstance from "../../services/AdminDashboard/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FiUserCheck } from "react-icons/fi";
import PageHeader from "../PageHeader";
import TimesheetSidebar from "./timesheetSidebar";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed"; // same key used elsewhere

export default function TimesheetApprovers() {
  const [departments, setDepartments] = useState([]);
  const [approversList, setApproversList] = useState([]);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    department: "",
    approver: "",
  });

  // sidebar collapse state watcher (to compute main margin)
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

  // IMPORTANT: match exact sidebar widths to avoid seam (w-16 / w-56)
  const mainMarginClass = sidebarCollapsed ? "md:ml-16" : "md:ml-56";

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/logout", {
        withCredentials: true,
      });
      if (res.data.status === "success") {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchTimesheetApprovers(filters);
      setData(res.data.results || []);
      setDepartments(res.data.departments || []);
      setApproversList(res.data.approvers || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      department: "",
      approver: "",
    });
    loadData();
  };

  const recordCount = data.length;

  return (
    <div
      className={`transition-all duration-200 px-4 md:px-10 py-6 ${mainMarginClass}`}
      style={{ backgroundColor: "#F5F7FF", minHeight: "100vh" }}
    >
      {/* Fixed/Reusable Sidebar */}
      <TimesheetSidebar onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Timesheet Approvers"
          subtitle="View and manage approver mapping by department and employee."
          statLabel="Total Records"
          statValue={recordCount}
          icon={<FiUserCheck className="text-white w-6 h-6" />}
        />

        <div className="space-y-6">
          {/* Filters card */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 px-6 md:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleFilter}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                    Department
                  </p>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept, i) => (
                      <option key={i} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[11px] uppercase font-semibold text-slate-500 mb-1">
                    Approver
                  </p>
                  <select
                    name="approver"
                    value={filters.approver}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Approvers</option>
                    {approversList.map((a, i) => (
                      <option key={i} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-[#4C6FFF] text-white rounded-2xl px-6 py-2 text-xs font-semibold shadow hover:bg-[#3e54d4]"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </section>

          {/* Summary + CSV */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">{recordCount}</span>{" "}
              records
            </p>

            <a
              href={downloadCSVApprovers(filters.department, filters.approver)}
              className="border border-emerald-400 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-100"
            >
              ⬇️ Download CSV
            </a>
          </div>

          {/* Table */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F3F5FF] text-slate-600 text-[11px] uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Approver ID</th>
                  <th className="px-4 py-3 text-left">Approver Name</th>
                  <th className="px-4 py-3 text-left">Department</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-slate-100"
                    >
                      <td className="px-4 py-3">{row.employee_id}</td>
                      <td className="px-4 py-3">{row.employee_name}</td>
                      <td className="px-4 py-3">{row.approver_id || "-"}</td>
                      <td className="px-4 py-3">{row.approver_name || "-"}</td>
                      <td className="px-4 py-3">{row.department}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-slate-500 text-xs"
                    >
                      No records found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
