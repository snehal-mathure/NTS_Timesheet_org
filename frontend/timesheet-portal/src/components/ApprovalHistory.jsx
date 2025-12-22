// // src/pages/ApprovalHistory.jsx
// import React, { useEffect, useState, useRef } from "react";
// import UserDashboardSidebar from "../components/UserDashboardSidebar";
// import PageHeader from "../components/PageHeader";
// import approvalHistoryService from "../services/AdminDashboard/approvalHistoryService";
// import { FiDownload } from "react-icons/fi";
// import { FiTrash2 } from "react-icons/fi";

// const SIDEBAR_KEY = "td_sidebar_collapsed";
// const accent = "#4C6FFF";

// export default function ApprovalHistory() {
//   const [employees, setEmployees] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [timesheets, setTimesheets] = useState([]);

//   const [filters, setFilters] = useState({
//     employee_name: "",
//     status: "",
//     department: "",
//     date_range: "",
//     custom_start_date: "",
//     custom_end_date: ""
//   });

//   const [loading, setLoading] = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");
//   const mountedRef = useRef(true);

//   useEffect(() => {
//     mountedRef.current = true;
//     loadInitialData();
//     const onCustom = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
//     const onStorage = (e) => {
//       if (e?.key === SIDEBAR_KEY) setSidebarCollapsed(e.newValue === "true");
//     };
//     window.addEventListener("td_sidebar_change", onCustom);
//     window.addEventListener("storage", onStorage);

//     return () => {
//       mountedRef.current = false;
//       window.removeEventListener("td_sidebar_change", onCustom);
//       window.removeEventListener("storage", onStorage);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       const data = await approvalHistoryService.getInitialData();
//       if (!mountedRef.current) return;
//       setEmployees(data.employees || []);
//       setDepartments(data.departments || []);
//       setTimesheets(data.timesheets || []);
//     } catch (err) {
//       console.error("Failed to load initial data", err);
//     } finally {
//       if (mountedRef.current) setLoading(false);
//     }
//   };

//   const handleFilter = async () => {
//     setLoading(true);
//     try {
//       const data = await approvalHistoryService.getFiltered(filters);
//       if (!mountedRef.current) return;
//       setTimesheets(data.timesheets || []);
//     } catch (err) {
//       console.error("Filter error", err);
//     } finally {
//       if (mountedRef.current) setLoading(false);
//     }
//   };

//   const deleteTimesheet = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this approved timesheet?")) return;
//     try {
//       await approvalHistoryService.deleteTimesheet(id);
//       await handleFilter();
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   // responsive main margin depending on sidebar collapsed state
//   const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-64";

//   const renderStatusPill = (status) => {
//     return (
//       <span
//         className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full 
//                     text-xs font-semibold transition-all ${
//           status === "Approved"
//             ? "bg-emerald-600 text-white"
//             : status === "Submitted"
//             ? "bg-blue-50 text-blue-600 border border-blue-300 hover:bg-blue-100"
//             : "bg-rose-500 text-white"
//         }`}
//       >
//         {status}
//       </span>
//     );
//   };

//   return (
//     <div className="min-h-screen flex bg-[#F5F7FF]">
//       <UserDashboardSidebar />

//       <main className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6`}>
//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* Page header */}
//           <PageHeader
//             section="Approvals"
//             title="Approve Timesheets"
//             description="View approval history and manage approved timesheets."
//           />
//           {/* Download CSV */}
//           <div className="flex justify-start">
//             <a
//               href={loading ? undefined : approvalHistoryService.getDownloadURL(filters)}
//               title={loading ? "Loading..." : "Download CSV"}
//               className={`inline-flex items-center justify-center p-2 rounded-xl 
//                 border transition ${
//                   loading
//                     ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                     : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
//                 }`}
//             >
//               <FiDownload size={16} />
//             </a>
//           </div>

//           {/* Filters card */}
//           <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.06)] overflow-hidden">
//             <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                     <svg className="w-6 h-6 text-[#4C6FFF]" fill="none" viewBox="0 0 24 24">
//                       <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.4" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-slate-900">Approval History</h3>
//                     <p className="text-sm text-slate-500">Filter and export approved timesheets.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="px-6 py-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Employee */}
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">Employee</label>
//                   <select
//                     className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
//                     value={filters.employee_name}
//                     onChange={(e) => setFilters({ ...filters, employee_name: e.target.value })}
//                   >
//                     <option value="">All Employees</option>
//                     {employees.map((emp) => (
//                       <option key={emp.empid} value={`${emp.fname} ${emp.lname}`}>
//                         {emp.fname} {emp.lname}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Status */}
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
//                   <select
//                     className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
//                     value={filters.status}
//                     onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                   >
//                     <option value="">All</option>
//                     <option>Approved</option>
//                     <option>Pending</option>
//                     <option>Rejected</option>
//                   </select>
//                 </div>

//                 {/* Department */}
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
//                   <select
//                     className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
//                     value={filters.department}
//                     onChange={(e) => setFilters({ ...filters, department: e.target.value })}
//                   >
//                     <option value="">All Departments</option>
//                     {departments.map((d) => (
//                       <option key={d.id} value={d.id}>{d.dept_name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Date range */}
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">Date Range</label>
//                   <select
//                     className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
//                     value={filters.date_range}
//                     onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
//                   >
//                     <option value="">All Dates</option>
//                     <option value="this_week">This Week</option>
//                     <option value="last_week">Last Week</option>
//                     <option value="custom">Custom</option>
//                   </select>
//                 </div>

//                 {/* From */}
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
//                   <input
//                     type="date"
//                     className="w-full rounded-2xl border border-[#e1e4f3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
//                     value={filters.custom_start_date}
//                     onChange={(e) => setFilters({ ...filters, custom_start_date: e.target.value })}
//                   />
//                 </div>

//                 {/* To */}
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
//                   <input
//                     type="date"
//                     className="w-full rounded-2xl border border-[#e1e4f3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
//                     value={filters.custom_end_date}
//                     onChange={(e) => setFilters({ ...filters, custom_end_date: e.target.value })}
//                   />
//                 </div>

//                 <div className="flex items-end">
//                   <button
//                     onClick={handleFilter}
//                     className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold"
//                     style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
//                   >
//                     Apply Filter
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="px-6 py-4">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
//                   <thead className="bg-[#F3F5FF]">
//                     <tr className="text-slate-600">
//                       <th className="py-3 px-4 text-left font-medium">Employee</th>
//                       <th className="py-3 px-4 text-left font-medium">Department</th>
//                       <th className="py-3 px-4 text-left font-medium">Week Starting</th>
//                       <th className="py-3 px-4 text-left font-medium">Status</th>
//                       <th className="py-3 px-4 text-left font-medium">Actions</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan="5" className="py-6 text-center text-slate-500">Loading...</td>
//                       </tr>
//                     ) : timesheets.length === 0 ? (
//                       <tr>
//                         <td colSpan="5" className="py-6 text-center text-slate-500">No approval history available.</td>
//                       </tr>
//                     ) : (
//                       timesheets.map((t) => (
//                         <tr key={t.id} className="hover:bg-[#FBFDFF] transition">
//                           <td className="py-3 px-4">{t.employee_name}</td>
//                           <td className="py-3 px-4">{t.department}</td>
//                           <td className="py-3 px-4">{t.week_start_date}</td>
//                           <td className="py-3 px-4">
//                             {renderStatusPill(t.status)}
//                           </td>
//                           <td className="py-3 px-4">
//                             {t.status === "Approved" && (
//                               <button
//                               className="p-2 rounded-xl bg-rose-100 text-rose-700 
//                                         border border-rose-200 hover:bg-rose-200 transition"
//                               onClick={() => deleteTimesheet(t.id)}
//                               title="Delete Timesheet"
//                             >
//                               <FiTrash2 size={15} />
//                             </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
//               <p className="text-[11px] md:text-xs text-slate-500">Tip: Use filters to narrow down history. You can export a CSV using the download link below.</p>
//             </div>
//           </div>

          
//         </div>
//       </main>
//     </div>
//   );
// }



// src/pages/ApprovalHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import UserDashboardSidebar from "../components/UserDashboardSidebar";
import PageHeader from "../components/PageHeader";
import approvalHistoryService from "../services/AdminDashboard/approvalHistoryService";
import { FiDownload } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

const SIDEBAR_KEY = "td_sidebar_collapsed";
const accent = "#4C6FFF";

export default function ApprovalHistory() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const initialLoadRef = useRef(true);

  const [filters, setFilters] = useState({
    employee_name: "",
    status: "",
    department: "",
    date_range: "",
    custom_start_date: "",
    custom_end_date: ""
  });

  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadInitialData();
    const onCustom = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) setSidebarCollapsed(e.newValue === "true");
    };
    window.addEventListener("td_sidebar_change", onCustom);
    window.addEventListener("storage", onStorage);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("td_sidebar_change", onCustom);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    handleFilter();
  }, 400);

  return () => clearTimeout(timer);
}, [
  filters.employee_name,
  filters.status,
  filters.department,
  filters.date_range,
  filters.custom_start_date,
  filters.custom_end_date
]);


  const loadInitialData = async () => {
    setLoading(true);
    try {
      const data = await approvalHistoryService.getInitialData();
      if (!mountedRef.current) return;

      setEmployees(data.employees || []);
      setDepartments(data.departments || []);
      setTimesheets(data.timesheets || []);

      initialLoadRef.current = false; // ✅ IMPORTANT
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };


  const handleFilter = async () => {
    if (initialLoadRef.current) return; // ✅ correct check

    setLoading(true);
    try {
      const data = await approvalHistoryService.getFiltered(filters);
      if (!mountedRef.current) return;
      setTimesheets(data.timesheets || []);
    } catch (err) {
      console.error("Filter error", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const deleteTimesheet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this approved timesheet?")) return;
    try {
      await approvalHistoryService.deleteTimesheet(id);
      await handleFilter();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // responsive main margin depending on sidebar collapsed state
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-64";

  const renderStatusPill = (status) => {
    return (
      <span
        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full 
                    text-xs font-semibold transition-all ${
          status === "Approved"
            ? "bg-emerald-600 text-white"
            : status === "Submitted"
            ? "bg-blue-50 text-blue-600 border border-blue-300 hover:bg-blue-100"
            : "bg-rose-500 text-white"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FF]">
      <UserDashboardSidebar />

      <main className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6`}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page header */}
          <PageHeader
            section="Approvals"
            title="Approve Timesheets"
            description="View approval history and manage approved timesheets."
          />
          {/* Download CSV */}
          <div className="flex justify-start">
            <a
              href={loading ? undefined : approvalHistoryService.getDownloadURL(filters)}
              title={loading ? "Loading..." : "Download CSV"}
              className={`inline-flex items-center justify-center p-2 rounded-xl 
                border transition ${
                  loading
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                }`}
            >
              <FiDownload size={16} />
            </a>
          </div>

          {/* Filters card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-[#4C6FFF]" fill="none" viewBox="0 0 24 24">
                      <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Approval History</h3>
                    <p className="text-sm text-slate-500">Filter and export approved timesheets.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Employee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employee</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
                    value={filters.employee_name}
                    onChange={(e) => setFilters({ ...filters, employee_name: e.target.value })}
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.empid} value={`${emp.fname} ${emp.lname}`}>
                        {emp.fname} {emp.lname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Rejected</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.dept_name}</option>
                    ))}
                  </select>
                </div>

                {/* Date range */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date Range</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
                    value={filters.date_range}
                    onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
                  >
                    <option value="">All Dates</option>
                    <option value="this_week">This Week</option>
                    <option value="last_week">Last Week</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* From */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-[#e1e4f3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
                    value={filters.custom_start_date}
                    onChange={(e) => setFilters({ ...filters, custom_start_date: e.target.value })}
                  />
                </div>

                {/* To */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-[#e1e4f3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.15)]"
                    value={filters.custom_end_date}
                    onChange={(e) => setFilters({ ...filters, custom_end_date: e.target.value })}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleFilter}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold"
                    style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
                  <thead className="bg-[#F3F5FF]">
                    <tr className="text-slate-600">
                      <th className="py-3 px-4 text-left font-medium">Employee</th>
                      <th className="py-3 px-4 text-left font-medium">Department</th>
                      <th className="py-3 px-4 text-left font-medium">Week Starting</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-500">Loading...</td>
                      </tr>
                    ) : timesheets.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-500">No approval history available.</td>
                      </tr>
                    ) : (
                      timesheets.map((t) => (
                        <tr key={t.id} className="hover:bg-[#FBFDFF] transition">
                          <td className="py-3 px-4">{t.employee_name}</td>
                          <td className="py-3 px-4">{t.department}</td>
                          <td className="py-3 px-4">{t.week_start_date}</td>
                          <td className="py-3 px-4">
                            {renderStatusPill(t.status)}
                          </td>
                          <td className="py-3 px-4">
                            {t.status === "Approved" && (
                              <button
                              className="p-2 rounded-xl bg-rose-100 text-rose-700 
                                        border border-rose-200 hover:bg-rose-200 transition"
                              onClick={() => deleteTimesheet(t.id)}
                              title="Delete Timesheet"
                            >
                              <FiTrash2 size={15} />
                            </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
              <p className="text-[11px] md:text-xs text-slate-500">Tip: Use filters to narrow down history. You can export a CSV using the download link below.</p>
            </div>
          </div>

          
        </div>
      </main>
    </div>
  );
}
