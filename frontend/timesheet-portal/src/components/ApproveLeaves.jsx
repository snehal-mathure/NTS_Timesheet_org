
// // src/pages/ApproveLeaves.jsx
// import React, { useEffect, useState, useRef } from "react";
// import UserDashboardSidebar from "../components/UserDashboardSidebar";
// import PageHeader from "../components/PageHeader";
// import leaveService from "../services/AdminDashboard/leaveService";

// const SIDEBAR_KEY = "td_sidebar_collapsed";
// const accent = "#4C6FFF";

// export default function ApproveLeaves() {
//   const [loading, setLoading] = useState(true);
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [directReports, setDirectReports] = useState([]); // { empid, name }
//   const [reportingFilter, setReportingFilter] = useState("all");
//   const [selectedDirect, setSelectedDirect] = useState("all");
//   const [selectedIds, setSelectedIds] = useState(new Set());
//   const [expandedId, setExpandedId] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // layout
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");
//   const successRef = useRef(null);

//   useEffect(() => {
//     fetchData();

//     const onCustom = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
//     const onStorage = (e) => {
//       if (e?.key === SIDEBAR_KEY) setSidebarCollapsed(e.newValue === "true");
//     };

//     window.addEventListener("td_sidebar_change", onCustom);
//     window.addEventListener("storage", onStorage);
//     return () => {
//       window.removeEventListener("td_sidebar_change", onCustom);
//       window.removeEventListener("storage", onStorage);
//       if (successRef.current) clearTimeout(successRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function fetchData() {
//     try {
//       setLoading(true);
//       const res = await leaveService.getLeaveRequests();
//       // expected shape: { leave_requests: [...], direct_reports: [...], is_leave_admin: bool }
//       setLeaveRequests(res.leave_requests || []);
//       setDirectReports(res.direct_reports || []);
//       setIsAdmin(Boolean(res.is_leave_admin));
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load leave requests.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function filteredRows() {
//     return leaveRequests.filter((lr) => {
//       if (reportingFilter === "all") return true;
//       if (reportingFilter === "direct") {
//         return lr.reporting_type === "Direct/Indirect" || lr.reporting_type === "Direct";
//       }
//       if (reportingFilter === "indirect") {
//         if (selectedDirect === "all") return true;
//         return String(lr.direct_reporter) === String(selectedDirect);
//       }
//       return true;
//     });
//   }

//   function toggleSelectAll(checked) {
//     if (checked) {
//       const ids = new Set(filteredRows().map((r) => r.id));
//       setSelectedIds(ids);
//     } else {
//       setSelectedIds(new Set());
//     }
//   }

//   function toggleSelect(id) {
//     const s = new Set(selectedIds);
//     if (s.has(id)) s.delete(id);
//     else s.add(id);
//     setSelectedIds(s);
//   }

//   async function doSingleAction(lr, action) {
//     const comment = window.prompt(`Enter comments for ${action} (optional):`) || "";
//     try {
//       const payload = {
//         leave_requests: [
//           {
//             leave_req_id: lr.id,
//             action,
//             empid: lr.empid,
//           },
//         ],
//         comments: comment,
//       };
//       const res = await leaveService.approveRejectLeaves(payload);
//       alert(res.message || "Action completed");
//       await fetchData();
//       setSelectedIds(new Set());
//     } catch (err) {
//       console.error(err);
//       alert(err?.message || "Failed to process request");
//     }
//   }

//   async function doBulkAction(action) {
//     if (selectedIds.size === 0) {
//       alert("No leave requests selected.");
//       return;
//     }
//     const comment = window.prompt(`Enter comments for ${action} (optional):`) || "";
//     const arr = Array.from(selectedIds).map((id) => {
//       const row = leaveRequests.find((r) => r.id === id);
//       return { leave_req_id: id, empid: row?.empid, action };
//     });

//     try {
//       const res = await leaveService.approveRejectLeaves({ leave_requests: arr, comments: comment });
//       alert(res.message || "Bulk action completed");
//       await fetchData();
//       setSelectedIds(new Set());
//     } catch (err) {
//       console.error(err);
//       alert(err?.message || "Bulk action failed");
//     }
//   }

//   async function toggleExpand(lr) {
//     if (expandedId === lr.id) {
//       setExpandedId(null);
//       return;
//     }
//     try {
//       const details = await leaveService.getLeaveDetails(lr.id);
//       setLeaveRequests((prev) =>
//         prev.map((p) => (p.id === lr.id ? { ...p, leave_entries: details.leave_entries } : p))
//       );
//       setExpandedId(lr.id);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load details");
//     }
//   }

//   // responsive main margin based on sidebar collapsed
//   const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-64";

//   return (
//     <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
//       <UserDashboardSidebar />

//       <main className={`flex-1 px-4 md:px-10 py-6 transition-all duration-200 ${mainMarginClass}`}>
//         <div className="max-w-6xl mx-auto space-y-5">
//           <PageHeader
//             section="Leaves"
//             title="Leave Approvals"
//             description="Review leave requests from your reports and approve or reject them."
//           />

//           <div className="bg-white/95 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">
//             <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80 flex items-start justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                   <svg className="w-6 h-6 text-[#4C6FFF]" viewBox="0 0 24 24" fill="none">
//                     <path d="M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.4" />
//                   </svg>
//                 </div>

//                 <div>
//                   <h2 className="text-lg font-semibold text-slate-900">Approve Leaves</h2>
//                   <p className="text-sm text-slate-500">Approve or reject leave requests for your team.</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="text-sm text-slate-500">Manager Tools</div>
//                 <a
//                   href="/approvalhistoryleaves"
//                   className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold text-white shadow"
//                   style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
//                 >
//                   View History
//                 </a>
//               </div>
//             </div>

//             <div className="px-6 py-6">
//               {/* Controls */}
//               <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => doBulkAction("approve")}
//                     className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm"
//                   >
//                     Approve Selected
//                   </button>

//                   <button
//                     onClick={() => doBulkAction("reject")}
//                     className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-800 border border-rose-100 text-sm"
//                   >
//                     Reject Selected
//                   </button>
//                 </div>

//                 <div className="ml-auto flex items-center gap-4">
//                   <label className="text-sm text-slate-600">Select All</label>
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4"
//                     onChange={(e) => toggleSelectAll(e.target.checked)}
//                     checked={
//                       filteredRows().length > 0 &&
//                       filteredRows().every((r) => selectedIds.has(r.id))
//                     }
//                   />
//                 </div>
//               </div>

//               {/* Filters */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">Filter By</label>
//                   <select
//                     className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
//                     value={reportingFilter}
//                     onChange={(e) => {
//                       setReportingFilter(e.target.value);
//                       if (e.target.value !== "indirect") setSelectedDirect("all");
//                     }}
//                   >
//                     <option value="all">All Reports</option>
//                     <option value="direct">Direct Reports</option>
//                     <option value="indirect">Indirect Reports</option>
//                   </select>
//                 </div>

//                 {reportingFilter === "indirect" && (
//                   <div>
//                     <label className="block text-xs font-medium text-slate-600 mb-1">Select Direct Report</label>
//                     <select
//                       className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
//                       value={selectedDirect}
//                       onChange={(e) => setSelectedDirect(e.target.value)}
//                     >
//                       <option value="all">All Indirect Reports</option>
//                       {directReports.map((d) => (
//                         <option key={d.empid} value={d.empid}>
//                           {d.name} ({d.empid})
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 <div className="md:col-span-1 flex items-end">
//                   <div className="text-sm text-slate-500">
//                     Showing {filteredRows().length} request(s)
//                   </div>
//                 </div>
//               </div>

//               {/* Table */}
//               <div className="overflow-x-auto border rounded-2xl">
//                 <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
//                   <thead className="bg-[#F3F5FF]">
//                     <tr className="text-slate-600">
//                       <th className="p-3 w-12"></th>
//                       <th className="p-3 text-left">Employee ID</th>
//                       <th className="p-3 text-left">Employee Name</th>
//                       <th className="p-3 text-left">Leave Type</th>
//                       <th className="p-3 text-left">Start Date</th>
//                       <th className="p-3 text-left">End Date</th>
//                       <th className="p-3 text-left">Total Days</th>
//                       <th className="p-3 text-left">Reason</th>
//                       <th className="p-3 text-left">Status</th>
//                       <th className="p-3 text-left">Action</th>
//                     </tr>
//                   </thead>

//                   <tbody className="bg-white">
//                     {loading ? (
//                       <tr>
//                         <td colSpan="10" className="p-6 text-center text-slate-500">Loading leave requests...</td>
//                       </tr>
//                     ) : (
//                       filteredRows().map((lr) => (
//                         <React.Fragment key={lr.id}>
//                           <tr
//                             className="hover:bg-[#FBFDFF] cursor-pointer"
//                             onClick={(e) => {
//                               if (["BUTTON", "INPUT"].includes(e.target.tagName)) return;
//                               toggleExpand(lr);
//                             }}
//                           >
//                             <td className="p-3">
//                               <input
//                                 type="checkbox"
//                                 checked={selectedIds.has(lr.id)}
//                                 onChange={(e) => {
//                                   e.stopPropagation();
//                                   toggleSelect(lr.id);
//                                 }}
//                               />
//                             </td>

//                             <td className="p-3 font-medium text-slate-800">{lr.empid}</td>
//                             <td className="p-3 text-slate-700">{lr.employee_name}</td>
//                             <td className="p-3">{lr.leave_type}</td>
//                             <td className="p-3">{lr.st_dt}</td>
//                             <td className="p-3">{lr.ed_dt}</td>
//                             <td className="p-3">{Number(lr.total_days).toFixed(1)}</td>
//                             <td className="p-3 text-slate-600" title={lr.reason}>
//                               {lr.reason?.length > 30 ? lr.reason.slice(0, 30) + "..." : lr.reason}
//                             </td>
//                             <td className="p-3">
//                               <span className={`px-2 py-1 rounded text-xs font-semibold ${
//                                 lr.status === "Approved" ? "bg-emerald-600 text-white" :
//                                 lr.status === "Pending" ? "bg-[#4C6FFF] text-white" :
//                                 "bg-rose-500 text-white"
//                               }`}>
//                                 {lr.status}
//                               </span>
//                             </td>

//                             <td className="p-3 whitespace-nowrap">
//                               <button
//                                 className="px-3 py-1 mr-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   doSingleAction(lr, "approve");
//                                 }}
//                               >
//                                 Approve
//                               </button>

//                               <button
//                                 className="px-3 py-1 rounded-2xl bg-rose-50 text-rose-800 border border-rose-100 text-sm"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   doSingleAction(lr, "reject");
//                                 }}
//                               >
//                                 Reject
//                               </button>
//                             </td>
//                           </tr>

//                           {expandedId === lr.id && (
//                             <tr>
//                               <td colSpan={10} className="p-4 bg-[#FBFDFF]">
//                                 <div>
//                                   <h4 className="font-medium mb-2">Leave Details</h4>
//                                   {lr.leave_entries ? (
//                                     <div className="overflow-x-auto">
//                                       <table className="w-full text-sm">
//                                         <thead>
//                                           <tr className="text-left">
//                                             <th className="p-2">Date</th>
//                                             <th className="p-2">Half Day</th>
//                                             <th className="p-2">Half Type</th>
//                                           </tr>
//                                         </thead>
//                                         <tbody>
//                                           {lr.leave_entries.map((e, idx) => (
//                                             <tr key={idx}>
//                                               <td className="p-2">{e.date}</td>
//                                               <td className="p-2">{e.is_half ? "Yes" : "No"}</td>
//                                               <td className="p-2">{e.half_type || "N/A"}</td>
//                                             </tr>
//                                           ))}
//                                         </tbody>
//                                       </table>
//                                     </div>
//                                   ) : (
//                                     <div className="text-sm text-slate-500">Loading...</div>
//                                   )}
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       ))
//                     )}

//                     {!loading && filteredRows().length === 0 && (
//                       <tr>
//                         <td colSpan={10} className="p-6 text-center text-slate-500">
//                           No leave requests found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
//               <p className="text-[11px] md:text-xs text-slate-500">Tip: Click a row to expand details. Use bulk actions for multiple requests.</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// src/pages/ApproveLeaves.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import UserDashboardSidebar from "../components/UserDashboardSidebar";
import PageHeader from "../components/PageHeader";
import leaveService from "../services/AdminDashboard/leaveService";
import Pagination from "../components/Pagination"; // adjust path if needed

const SIDEBAR_KEY = "td_sidebar_collapsed";
const accent = "#4C6FFF";

export default function ApproveLeaves() {
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [directReports, setDirectReports] = useState([]); // { empid, name }
  const [reportingFilter, setReportingFilter] = useState("all");
  const [selectedDirect, setSelectedDirect] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");
  const successRef = useRef(null);

  useEffect(() => {
    fetchData();

    const onCustom = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) setSidebarCollapsed(e.newValue === "true");
    };

    window.addEventListener("td_sidebar_change", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("td_sidebar_change", onCustom);
      window.removeEventListener("storage", onStorage);
      if (successRef.current) clearTimeout(successRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await leaveService.getLeaveRequests();
      // expected shape: { leave_requests: [...], direct_reports: [...], is_leave_admin: bool }
      setLeaveRequests(res.leave_requests || []);
      setDirectReports(res.direct_reports || []);
      setIsAdmin(Boolean(res.is_leave_admin));
    } catch (err) {
      console.error(err);
      alert("Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }

  function filteredRows() {
    return leaveRequests.filter((lr) => {
      if (reportingFilter === "all") return true;
      if (reportingFilter === "direct") {
        return lr.reporting_type === "Direct/Indirect" || lr.reporting_type === "Direct";
      }
      if (reportingFilter === "indirect") {
        if (selectedDirect === "all") return true;
        return String(lr.direct_reporter) === String(selectedDirect);
      }
      return true;
    });
  }

  // ensure page resets when filter or data changes
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [reportingFilter, selectedDirect, leaveRequests, pageSize]);

  // compute paged rows
  const totalItems = filteredRows().length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // clamp page
  useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pagedRows = useMemo(() => {
    const all = filteredRows();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return all.slice(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveRequests, reportingFilter, selectedDirect, page, pageSize]);

  function toggleSelectAll(checked) {
    if (checked) {
      const ids = new Set(pagedRows.map((r) => r.id));
      // preserve selections from other pages? here we replace selection with current page's ids
      setSelectedIds(ids);
    } else {
      setSelectedIds(new Set());
    }
  }

  function toggleSelect(id) {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedIds(s);
  }

  async function doSingleAction(lr, action) {
    const comment = window.prompt(`Enter comments for ${action} (optional):`) || "";
    try {
      const payload = {
        leave_requests: [
          {
            leave_req_id: lr.id,
            action,
            empid: lr.empid,
          },
        ],
        comments: comment,
      };
      const res = await leaveService.approveRejectLeaves(payload);
      alert(res.message || "Action completed");
      await fetchData();
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to process request");
    }
  }

  async function doBulkAction(action) {
    if (selectedIds.size === 0) {
      alert("No leave requests selected.");
      return;
    }
    const comment = window.prompt(`Enter comments for ${action} (optional):`) || "";
    const arr = Array.from(selectedIds).map((id) => {
      const row = leaveRequests.find((r) => r.id === id);
      return { leave_req_id: id, empid: row?.empid, action };
    });

    try {
      const res = await leaveService.approveRejectLeaves({ leave_requests: arr, comments: comment });
      alert(res.message || "Bulk action completed");
      await fetchData();
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert(err?.message || "Bulk action failed");
    }
  }

  async function toggleExpand(lr) {
    if (expandedId === lr.id) {
      setExpandedId(null);
      return;
    }
    try {
      const details = await leaveService.getLeaveDetails(lr.id);
      setLeaveRequests((prev) =>
        prev.map((p) => (p.id === lr.id ? { ...p, leave_entries: details.leave_entries } : p))
      );
      setExpandedId(lr.id);
    } catch (err) {
      console.error(err);
      alert("Failed to load details");
    }
  }

  // responsive main margin based on sidebar collapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-64";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      <UserDashboardSidebar />

      <main className={`flex-1 px-4 md:px-10 py-6 transition-all duration-200 ${mainMarginClass}`}>
        <div className="max-w-6xl mx-auto space-y-5">
          <PageHeader
            section="Leaves"
            title="Leave Approvals"
            description="Review leave requests from your reports and approve or reject them."
          />

          <div className="bg-white/95 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-[#4C6FFF]" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Approve Leaves</h2>
                  <p className="text-sm text-slate-500">Approve or reject leave requests for your team.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500">Manager Tools</div>
                <a
                  href="/approvalhistoryleaves"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold text-white shadow"
                  style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
                >
                  View History
                </a>
              </div>
            </div>

            <div className="px-6 py-6">
              {/* Controls */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => doBulkAction("approve")}
                    className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm"
                  >
                    Approve Selected
                  </button>

                  <button
                    onClick={() => doBulkAction("reject")}
                    className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-800 border border-rose-100 text-sm"
                  >
                    Reject Selected
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  <label className="text-sm text-slate-600">Select All (Page)</label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={pagedRows.length > 0 && pagedRows.every((r) => selectedIds.has(r.id))}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Filter By</label>
                  <select
                    className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                    value={reportingFilter}
                    onChange={(e) => {
                      setReportingFilter(e.target.value);
                      if (e.target.value !== "indirect") setSelectedDirect("all");
                    }}
                  >
                    <option value="all">All Reports</option>
                    <option value="direct">Direct Reports</option>
                    <option value="indirect">Indirect Reports</option>
                  </select>
                </div>

                {reportingFilter === "indirect" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Select Direct Report</label>
                    <select
                      className="w-full rounded-2xl border border-[#e1e4f3] px-3 py-2 text-sm bg-white"
                      value={selectedDirect}
                      onChange={(e) => setSelectedDirect(e.target.value)}
                    >
                      <option value="all">All Indirect Reports</option>
                      {directReports.map((d) => (
                        <option key={d.empid} value={d.empid}>
                          {d.name} ({d.empid})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-1 flex items-end">
                  <div className="text-sm text-slate-500">Showing {filteredRows().length} request(s)</div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
                  <thead className="bg-[#F3F5FF]">
                    <tr className="text-slate-600">
                      <th className="p-3 w-12"></th>
                      <th className="p-3 text-left">Employee ID</th>
                      <th className="p-3 text-left">Employee Name</th>
                      <th className="p-3 text-left">Leave Type</th>
                      <th className="p-3 text-left">Start Date</th>
                      <th className="p-3 text-left">End Date</th>
                      <th className="p-3 text-left">Total Days</th>
                      <th className="p-3 text-left">Reason</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="p-6 text-center text-slate-500">Loading leave requests...</td>
                      </tr>
                    ) : (
                      pagedRows.map((lr) => (
                        <React.Fragment key={lr.id}>
                          <tr
                            className="hover:bg-[#FBFDFF] cursor-pointer"
                            onClick={(e) => {
                              if (["BUTTON", "INPUT"].includes(e.target.tagName)) return;
                              toggleExpand(lr);
                            }}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(lr.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(lr.id);
                                }}
                              />
                            </td>

                            <td className="p-3 font-medium text-slate-800">{lr.empid}</td>
                            <td className="p-3 text-slate-700">{lr.employee_name}</td>
                            <td className="p-3">{lr.leave_type}</td>
                            <td className="p-3">{lr.st_dt}</td>
                            <td className="p-3">{lr.ed_dt}</td>
                            <td className="p-3">{Number(lr.total_days).toFixed(1)}</td>
                            <td className="p-3 text-slate-600" title={lr.reason}>
                              {lr.reason?.length > 30 ? lr.reason.slice(0, 30) + "..." : lr.reason}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                lr.status === "Approved" ? "bg-emerald-600 text-white" :
                                lr.status === "Pending" ? "bg-[#4C6FFF] text-white" :
                                "bg-rose-500 text-white"
                              }`}>
                                {lr.status}
                              </span>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <button
                                className="px-3 py-1 mr-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  doSingleAction(lr, "approve");
                                }}
                              >
                                Approve
                              </button>

                              <button
                                className="px-3 py-1 rounded-2xl bg-rose-50 text-rose-800 border border-rose-100 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  doSingleAction(lr, "reject");
                                }}
                              >
                                Reject
                              </button>
                            </td>
                          </tr>

                          {expandedId === lr.id && (
                            <tr>
                              <td colSpan={10} className="p-4 bg-[#FBFDFF]">
                                <div>
                                  <h4 className="font-medium mb-2">Leave Details</h4>
                                  {lr.leave_entries ? (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="text-left">
                                            <th className="p-2">Date</th>
                                            <th className="p-2">Half Day</th>
                                            <th className="p-2">Half Type</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {lr.leave_entries.map((e, idx) => (
                                            <tr key={idx}>
                                              <td className="p-2">{e.date}</td>
                                              <td className="p-2">{e.is_half ? "Yes" : "No"}</td>
                                              <td className="p-2">{e.half_type || "N/A"}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-slate-500">Loading...</div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}

                    {!loading && pagedRows.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-500">No leave requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                totalItems={totalItems}
                page={page}
                pageSize={pageSize}
                onPageChange={(p) => {
                  setPage(p);
                  // when changing page we keep selectedIds as-is (so some selections can span pages)
                  // if you want to clear selections on page change, uncomment next line:
                  // setSelectedIds(new Set());
                }}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                  setSelectedIds(new Set());
                }}
                pageSizeOptions={[5, 10, 20, 50]}
                maxButtons={7}
              />
            </div>

            <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
              <p className="text-[11px] md:text-xs text-slate-500">Tip: Click a row to expand details. Use bulk actions for multiple requests.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
