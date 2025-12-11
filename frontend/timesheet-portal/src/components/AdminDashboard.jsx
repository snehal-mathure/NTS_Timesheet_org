// // src/components/AdminDashboard.jsx
// import React, { useEffect, useState } from "react";
// import Sidebar from "./Sidebar";
// import {
//   getAdminDashboard,
//   exportClientAllocationsCSV,
// } from "../services/AdminDashboard/admindashboard";

// import { Pie, Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";

// import {
//   FiMenu,
//   FiLogOut,
//   FiUsers,
//   FiBriefcase,
//   FiLayers,
//   FiPieChart,
//   FiDownload,
//   FiX,
// } from "react-icons/fi";

// ChartJS.register(ArcElement, Tooltip, Legend);

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     totalClients: 0,
//     totalProjects: 0,
//   });

//   const [clientAllocations, setClientAllocations] = useState([]);
//   const [departmentAllocations, setDepartmentAllocations] = useState([]);
//   const [billability, setBillability] = useState({
//     billable: 0,
//     nonBillable: 0,
//   });

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   const loadDashboard = async () => {
//     try {
//       setLoading(true);
//       const data = await getAdminDashboard();
//       console.log("getAdminDashboard response:", data);

//       if (data) {
//         setStats((prev) => ({ ...prev, ...(data.stats || {}) }));
//         setClientAllocations(
//           Array.isArray(data.clientAllocations)
//             ? data.clientAllocations
//             : []
//         );
//         setDepartmentAllocations(
//           Array.isArray(data.departmentAllocations)
//             ? data.departmentAllocations
//             : []
//         );
//         setBillability((prev) => ({
//           ...prev,
//           ...(data.billability || {}),
//         }));
//       }
//     } catch (error) {
//       console.error("Error loading dashboard:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalEmployees = stats?.totalEmployees ?? 0;
//   const totalClients = stats?.totalClients ?? 0;
//   const totalProjects = stats?.totalProjects ?? 0;

//   const handleExportClientAllocations = async () => {
//     try {
//       await exportClientAllocationsCSV();
//     } catch (err) {
//       console.error("Export CSV error:", err);
//       alert("Failed to export CSV");
//     }
//   };

//   // Chart data
//   const clientPieData = {
//     labels: clientAllocations.map((c) => c.client_name || "Unknown"),
//     datasets: [
//       {
//         data: clientAllocations.map(
//           (c) => Number(c.employee_count) || 0
//         ),
//         backgroundColor: ["#4C6FFF", "#22C55E", "#F97316", "#EC4899", "#6366F1"],
//       },
//     ],
//   };

//   const deptPieData = {
//     labels: departmentAllocations.map(
//       (d) => d.dept_name || "Unknown"
//     ),
//     datasets: [
//       {
//         data: departmentAllocations.map(
//           (d) => Number(d.employee_count) || 0
//         ),
//         backgroundColor: ["#0EA5E9", "#14B8A6", "#F59E0B", "#A855F7", "#10B981"],
//       },
//     ],
//   };

//   const billabilityData = {
//     labels: ["Billable", "Non-Billable"],
//     datasets: [
//       {
//         data: [
//           Number(billability?.billable) || 0,
//           Number(billability?.nonBillable) || 0,
//         ],
//         backgroundColor: ["#22C55E", "#EF4444"],
//       },
//     ],
//   };

//   return (
//     <div className="min-h-screen bg-[#EEF2FF] flex">
//       {/* Desktop Sidebar */}
//       <div className="hidden lg:block">
//         <Sidebar />
//       </div>

//       {/* Mobile Sidebar */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 lg:hidden">
//           <div
//             className="absolute inset-0 bg-black/30"
//             onClick={() => setSidebarOpen(false)}
//           />
//           <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
//             <div className="flex items-center justify-between px-4 py-3 border-b">
//               <span className="font-semibold text-slate-800 text-sm">
//                 Menu
//               </span>
//               <button
//                 onClick={() => setSidebarOpen(false)}
//                 className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
//               >
//                 <FiX size={14} />
//               </button>
//             </div>
//             <div className="p-3 overflow-y-auto h-full">
//               <Sidebar />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MAIN */}
//       <div className="flex-1 flex flex-col">
//         {/* Mobile top bar */}
//         <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
//             >
//               <FiMenu />
//             </button>
//             <span className="font-semibold text-slate-800 text-sm">
//               Admin Dashboard
//             </span>
//           </div>
//           <a
//             href="/logout"
//             className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100"
//           >
//             <FiLogOut size={14} />
//           </a>
//         </div>

//         <main className="px-4 md:px-8 py-6 md:py-8 max-w-6xl w-full mx-auto space-y-6">
//           {/* Gradient Header Card */}
//           <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] rounded-3xl p-[1px] shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
//             <div className="bg-white rounded-[22px] px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center">
//                   <FiPieChart className="text-slate-900" size={18} />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
//                     Overview
//                   </p>
//                   <h1 className="text-lg md:text-xl font-semibold text-slate-900">
//                     Admin Dashboard
//                   </h1>
//                   <p className="text-xs text-slate-500 mt-0.5">
//                     High-level snapshot of employees, clients, projects and
//                     billability.
//                   </p>
//                 </div>
//               </div>

//               <div className="hidden md:flex items-center gap-3">
//                 <button
//                   onClick={handleExportClientAllocations}
//                   type="button"
//                   className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
//                 >
//                   <FiDownload className="text-[13px]" />
//                   Client Allocation CSV
//                 </button>
//                 <a
//                   href="/logout"
//                   className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 text-white px-3.5 py-1.5 text-xs font-medium hover:bg-rose-700"
//                 >
//                   <FiLogOut className="text-[13px]" />
//                   Logout
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {/* Employees */}
//             <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] p-4 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
//                 <FiUsers size={18} />
//               </div>
//               <div>
//                 <p className="text-[11px] font-medium text-slate-500">
//                   Total Employees
//                 </p>
//                 <p className="text-xl font-semibold text-slate-900">
//                   {totalEmployees}
//                 </p>
//                 <p className="text-[11px] text-slate-400 mt-0.5">
//                   Company-wide headcount
//                 </p>
//               </div>
//             </div>

//             {/* Clients */}
//             <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] p-4 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
//                 <FiBriefcase size={18} />
//               </div>
//               <div>
//                 <p className="text-[11px] font-medium text-slate-500">
//                   Active Clients
//                 </p>
//                 <p className="text-xl font-semibold text-slate-900">
//                   {totalClients}
//                 </p>
//                 <p className="text-[11px] text-slate-400 mt-0.5">
//                   With current allocations
//                 </p>
//               </div>
//             </div>

//             {/* Projects */}
//             <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] p-4 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
//                 <FiLayers size={18} />
//               </div>
//               <div>
//                 <p className="text-[11px] font-medium text-slate-500">
//                   Active Projects
//                 </p>
//                 <p className="text-xl font-semibold text-slate-900">
//                   {totalProjects}
//                 </p>
//                 <p className="text-[11px] text-slate-400 mt-0.5">
//                   Ongoing client engagements
//                 </p>
//               </div>
//             </div>
//           </section>

//           {/* Charts Section */}
//           <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] px-4 py-5 md:px-5 md:py-6">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-xs font-semibold text-slate-700">
//                   Allocation & Billability
//                 </p>
//                 <p className="text-[11px] text-slate-400">
//                   Visual overview of how employees are distributed.
//                 </p>
//               </div>
//               <button
//                 onClick={loadDashboard}
//                 type="button"
//                 className="text-[11px] px-3 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
//               >
//                 {loading ? "Refreshing..." : "Refresh"}
//               </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
//               {/* Employees Per Client */}
//               <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 flex flex-col">
//                 <div className="flex items-center justify-between mb-2">
//                   <h2 className="text-xs font-semibold text-slate-700">
//                     Employees Per Client
//                   </h2>
//                   <button
//                     onClick={handleExportClientAllocations}
//                     type="button"
//                     className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
//                   >
//                     <FiDownload className="text-[11px]" />
//                     CSV
//                   </button>
//                 </div>
//                 {clientAllocations && clientAllocations.length > 0 ? (
//                   <div className="h-56 flex items-center justify-center">
//                     <Pie data={clientPieData} />
//                   </div>
//                 ) : (
//                   <p className="text-center text-xs text-slate-500 mt-6">
//                     No client allocation data.
//                   </p>
//                 )}
//               </div>

//               {/* Employees Per Department */}
//               <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 flex flex-col">
//                 <h2 className="text-xs font-semibold text-slate-700 mb-2 text-center">
//                   Employees Per Department
//                 </h2>
//                 {departmentAllocations &&
//                 departmentAllocations.length > 0 ? (
//                   <div className="h-56 flex items-center justify-center">
//                     <Pie data={deptPieData} />
//                   </div>
//                 ) : (
//                   <p className="text-center text-xs text-slate-500 mt-6">
//                     No department allocation data.
//                   </p>
//                 )}
//               </div>

//               {/* Billability */}
//               <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 flex flex-col">
//                 <h2 className="text-xs font-semibold text-slate-700 mb-2 text-center">
//                   Billable vs Non-Billable
//                 </h2>
//                 <div className="h-56 flex items-center justify-center">
//                   <Doughnut data={billabilityData} />
//                 </div>

//                 <div className="mt-3 flex justify-around text-[11px] text-slate-600">
//                   <div className="flex items-center gap-1">
//                     <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
//                     Billable: {billability?.billable ?? 0}
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
//                     Non-Billable: {billability?.nonBillable ?? 0}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }
// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  getAdminDashboard,
  exportClientAllocationsCSV,
} from "../services/AdminDashboard/admindashboard";

import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  FiMenu,
  FiLogOut,
  FiPieChart,
  FiDownload,
  FiX,
} from "react-icons/fi";

ChartJS.register(ArcElement, Tooltip, Legend);

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalClients: 0,
    totalProjects: 0,
  });

  const [clientAllocations, setClientAllocations] = useState([]);
  const [departmentAllocations, setDepartmentAllocations] = useState([]);
  const [billability, setBillability] = useState({
    billable: 0,
    nonBillable: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [loading, setLoading] = useState(false);

  // track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    // update layout if sidebar toggled elsewhere (same-tab or other tabs)
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

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      console.log("getAdminDashboard response:", data);

      if (data) {
        setStats((prev) => ({ ...prev, ...(data.stats || {}) }));
        setClientAllocations(
          Array.isArray(data.clientAllocations) ? data.clientAllocations : []
        );
        setDepartmentAllocations(
          Array.isArray(data.departmentAllocations) ? data.departmentAllocations : []
        );
        setBillability((prev) => ({
          ...prev,
          ...(data.billability || {}),
        }));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = stats?.totalEmployees ?? 0;
  const totalClients = stats?.totalClients ?? 0;
  const totalProjects = stats?.totalProjects ?? 0;

  const handleExportClientAllocations = async () => {
    try {
      await exportClientAllocationsCSV();
    } catch (err) {
      console.error("Export CSV error:", err);
      alert("Failed to export CSV");
    }
  };

  // Chart data
  const clientPieData = {
    labels: clientAllocations.map((c) => c.client_name || "Unknown"),
    datasets: [
      {
        data: clientAllocations.map((c) => Number(c.employee_count) || 0),
        backgroundColor: ["#4C6FFF", "#22C55E", "#F97316", "#EC4899", "#6366F1"],
      },
    ],
  };

  const deptPieData = {
    labels: departmentAllocations.map((d) => d.dept_name || "Unknown"),
    datasets: [
      {
        data: departmentAllocations.map((d) => Number(d.employee_count) || 0),
        backgroundColor: ["#0EA5E9", "#14B8A6", "#F59E0B", "#A855F7", "#10B981"],
      },
    ],
  };

  const billabilityData = {
    labels: ["Billable", "Non-Billable"],
    datasets: [
      {
        data: [Number(billability?.billable) || 0, Number(billability?.nonBillable) || 0],
        backgroundColor: ["#22C55E", "#EF4444"],
      },
    ],
  };

  // compute main margin:
  // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
  // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex">
      {/* FIXED SIDEBAR (desktop) */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-slate-800 text-sm">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              >
                <FiX size={14} />
              </button>
            </div>

            <div className="p-3 overflow-y-auto h-full">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${mainMarginClass}`}>
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              <FiMenu />
            </button>
            <span className="font-semibold text-slate-800 text-sm">Admin Dashboard</span>
          </div>
          <a
            href="/logout"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100"
          >
            <FiLogOut size={14} />
          </a>
        </div>

        <main className="px-4 md:px-8 py-6 md:py-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Gradient Header Card */}
          <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] rounded-3xl p-[1px] shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
            <div className="bg-white rounded-[22px] px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center">
                  <FiPieChart className="text-slate-900" size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Overview
                  </p>
                  <h1 className="text-lg md:text-xl font-semibold text-slate-900">Admin Dashboard</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-level snapshot of employees, clients, projects and billability.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={handleExportClientAllocations}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <FiDownload className="text-[13px]" />
                  Client Allocation CSV
                </button>
                <a
                  href="/logout"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 text-white px-3.5 py-1.5 text-xs font-medium hover:bg-rose-700"
                >
                  <FiLogOut className="text-[13px]" />
                  Logout
                </a>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Employees */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M..." /></svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Total Employees</p>
                <p className="text-xl font-semibold text-slate-900">{totalEmployees}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Company-wide headcount</p>
              </div>
            </div>

            {/* Clients */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M..." /></svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Active Clients</p>
                <p className="text-xl font-semibold text-slate-900">{totalClients}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">With current allocations</p>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M..." /></svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Active Projects</p>
                <p className="text-xl font-semibold text-slate-900">{totalProjects}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ongoing client engagements</p>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_14px_35px_rgba(15,23,42,0.06)] px-4 py-5 md:px-5 md:py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-700">Allocation & Billability</p>
                <p className="text-[11px] text-slate-400">Visual overview of how employees are distributed.</p>
              </div>
              <button
                onClick={loadDashboard}
                type="button"
                className="text-[11px] px-3 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Employees Per Client */}
              <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-semibold text-slate-700">Employees Per Client</h2>
                  <button
                    onClick={handleExportClientAllocations}
                    type="button"
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  >
                    <FiDownload className="text-[11px]" />
                    CSV
                  </button>
                </div>
                {clientAllocations && clientAllocations.length > 0 ? (
                  <div className="h-56 flex items-center justify-center">
                    <Pie data={clientPieData} />
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500 mt-6">No client allocation data.</p>
                )}
              </div>

              {/* Employees Per Department */}
              <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 flex flex-col">
                <h2 className="text-xs font-semibold text-slate-700 mb-2 text-center">Employees Per Department</h2>
                {departmentAllocations && departmentAllocations.length > 0 ? (
                  <div className="h-56 flex items-center justify-center">
                    <Pie data={deptPieData} />
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500 mt-6">No department allocation data.</p>
                )}
              </div>

              {/* Billability */}
              <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 flex flex-col">
                <h2 className="text-xs font-semibold text-slate-700 mb-2 text-center">Billable vs Non-Billable</h2>
                <div className="h-56 flex items-center justify-center">
                  <Doughnut data={billabilityData} />
                </div>

                <div className="mt-3 flex justify-around text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    Billable: {billability?.billable ?? 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    Non-Billable: {billability?.nonBillable ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
