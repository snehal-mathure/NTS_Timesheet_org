
// // src/pages/UtilizationReport.jsx
// import React, { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import PageHeader from "../components/PageHeader";

// import {
//   getUtilizationReport,
//   getFiltersList,
//   getCsvDownloadUrl,
// } from "../services/AdminDashboard/utilizationService";

// const accent = "#4C6FFF";

// export default function UtilizationReport() {
//   const [filters, setFilters] = useState({
//     department: "All",
//     client: "All",
//     start_date: "",
//     end_date: "",
//   });

//   const [departments, setDepartments] = useState(["All"]);
//   const [clients, setClients] = useState(["All"]);
//   const [data, setData] = useState([]);

//   // Load dropdown options
//   const loadDropdowns = async () => {
//     try {
//       const res = await getFiltersList();
//       if (res.status === "success") {
//         setDepartments(["All", ...res.departments_list.map((d) => d.dept_name)]);
//         setClients([
//           "All",
//           ...res.clients_list.map((c) => c.client_name.split("(")[0].trim()),
//         ]);
//       }
//     } catch (err) {
//       console.error("Dropdown load error:", err);
//     }
//   };

//   // Fetch table data
//   const fetchData = async () => {
//     if (!filters.start_date || !filters.end_date) {
//       setData([]);
//       return;
//     }
//     try {
//       const res = await getUtilizationReport(filters);
//       if (res.status === "success" && Array.isArray(res.data)) {
//         setData(res.data);
//       } else {
//         setData([]);
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       setData([]);
//     }
//   };

//   useEffect(() => {
//     loadDropdowns();
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [filters]);

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const clearFilters = () => {
//     setFilters({
//       department: "All",
//       client: "All",
//       start_date: "",
//       end_date: "",
//     });
//     setData([]);
//   };

//   const downloadCSV = async () => {
//     try {
//       const res = await fetch(getCsvDownloadUrl(filters), {
//         method: "GET",
//         credentials: "include",
//       });

//       const result = await res.json();
//       if (!result.file) return alert("CSV unavailable");

//       const blob = new Blob([result.file], { type: "text/csv;charset=utf-8;" });
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = result.filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       alert("Download failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
//       <Sidebar />

//       <main className="flex-1 px-4 md:px-10 py-6 md:py-4">
//         <div className="max-w-6xl mx-auto space-y-5 mt-4">

//           <PageHeader
//             section="Reports"
//             title="Utilization Report"
//             description="View employee billable & non-billable utilization."
//           />

//           {/* Filters Card */}
//           <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
//             <h3 className="text-lg font-semibold text-slate-800 mb-4">
//               Filters
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//               <div>
//                 <label className="font-medium text-sm text-slate-700">Department</label>
//                 <select
//                   name="department"
//                   value={filters.department}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
//                 >
//                   {departments.map((d, idx) => (
//                     <option key={idx} value={d}>{d}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="font-medium text-sm text-slate-700">Client</label>
//                 <select
//                   name="client"
//                   value={filters.client}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
//                 >
//                   {clients.map((c, idx) => (
//                     <option key={idx} value={c}>{c}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="font-medium text-sm text-slate-700">Start Date</label>
//                 <input
//                   type="date"
//                   name="start_date"
//                   value={filters.start_date}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="font-medium text-sm text-slate-700">End Date</label>
//                 <input
//                   type="date"
//                   name="end_date"
//                   value={filters.end_date}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
//                 />
//               </div>
//             </div>

//             {/* Updated non-red button */}
//             <button
//               onClick={clearFilters}
//               className="mt-4 px-5 py-2 rounded-2xl font-semibold text-slate-700 shadow bg-[#E6E9F8] hover:bg-[#d8dcf7] text-sm"
//             >
//               Clear Filters
//             </button>
//           </div>

//           {/* Table Card */}
//           <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">

//             {/* Header Bar */}
//             <div className="px-6 py-4 border-b border-[#e5e7f5] bg-white/80 flex justify-between items-center">
//               <h3 className="text-lg font-semibold text-slate-800">
//                 Results ({data.length} record(s) found)
//               </h3>

//               {/* Download CSV on right side */}
//               <button
//                 onClick={downloadCSV}
//                 className="px-5 py-2 rounded-2xl text-white font-semibold shadow hover:scale-[1.02] transition"
//                 style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
//               >
//                 Download CSV
//               </button>
//             </div>

//             {/* TABLE */}
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">

//                 <thead className="bg-[#F3F5FF] text-slate-700">
//                   <tr>
//                     <th className="p-3 font-semibold text-left">Employee Name</th>
//                     <th className="p-3 font-semibold text-left">Department</th>
//                     <th className="p-3 font-semibold text-left">Client Assigned</th>
//                     <th className="p-3 font-semibold text-left">Project Names</th>
//                     <th className="p-3 font-semibold text-left">Client Start - End</th>
//                     <th className="p-3 font-semibold text-left">Billed Hours</th>
//                     <th className="p-3 font-semibold text-left">Non-Billable Hours</th>
//                     <th className="p-3 font-semibold text-left">Billable Hours</th>
//                     <th className="p-3 font-semibold text-left">Billed Utilization %</th>
//                     <th className="p-3 font-semibold text-left">Non-Billable Utilization %</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {data.length > 0 ? (
//                     data.map((row, idx) => (
//                       <tr key={idx} className="hover:bg-[#F8F9FF] transition border-b">
//                         <td className="p-3">{row.employee_name}</td>
//                         <td className="p-3">{row.department}</td>
//                         <td className="p-3">{row.client_name}</td>
//                         <td className="p-3">{row.projects?.join(", ") || "-"}</td>
//                         <td className="p-3">{row.client_start_end}</td>
//                         <td className="p-3">{row.billed_hours}</td>
//                         <td className="p-3">{row.non_billable_hours}</td>
//                         <td className="p-3">{row.billable_hours}</td>
//                         <td className="p-3">{row.billed_utilization}%</td>
//                         <td className="p-3">{row.non_billable_utilization}%</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="p-6 text-center text-slate-500">
//                         No Records Found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>

//               </table>
//             </div>

//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// src/pages/UtilizationReport.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

import {
  getUtilizationReport,
  getFiltersList,
  getCsvDownloadUrl,
} from "../services/AdminDashboard/utilizationService";

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
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
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
  };

  const downloadCSV = async () => {
    try {
      const url = getCsvDownloadUrl(filters);
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const result = await res.json();
        if (!result?.file) return alert("CSV unavailable");

        const maybeBase64 = result.file;
        let blob;
        if (/^[A-Za-z0-9+/=]+$/.test(maybeBase64.replace(/\s+/g, "")) && maybeBase64.length > 100) {
          const byteChars = atob(maybeBase64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: "text/csv;charset=utf-8;" });
        } else {
          blob = new Blob([maybeBase64], { type: "text/csv;charset=utf-8;" });
        }

        const downloadName = result.filename || `utilization_${filters.start_date || 'all'}_${filters.end_date || 'all'}.csv`;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }

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
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl p-4 md:p-6 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
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
              <div className="flex flex-col items-end justify-between gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-2xl font-semibold text-slate-700 shadow bg-[#E6E9F8] hover:bg-[#d8dcf7] text-sm"
                >
                  Clear Filters
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
                  Results <span className="text-slate-500 font-medium">({data.length} record(s) found)</span>
                </h3>
                <div className="text-xs text-slate-500 mt-1">{loadingData ? "Fetching data..." : ""}</div>
              </div>

              {/* Download CSV on right side */}
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 rounded-2xl text-white font-semibold shadow hover:scale-[1.02] transition text-sm"
                  style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
                >
                  Download CSV
                </button>
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
                  {data.length > 0 ? (
                    data.map((row, idx) => (
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

          </div>
        </div>
      </main>
    </div>
  );
}
