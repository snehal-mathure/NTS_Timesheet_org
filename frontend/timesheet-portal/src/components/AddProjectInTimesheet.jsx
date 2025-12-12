// // src/pages/AddProjectInTimesheet.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import PageHeader from "../components/PageHeader";
// import chargeCodeService from "../services/UserDashboard/chargeCodeService";
// import { FiSearch, FiRotateCw, FiCheckCircle, FiX } from "react-icons/fi";
// import UserDashboardSidebar from "./UserDashboardSidebar";

// const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

// export default function AddProjectInTimesheet() {
//   const [clients, setClients] = useState([]);
//   const [clientProjects, setClientProjects] = useState({});
//   const [selectedClient, setSelectedClient] = useState(null); // null => only clients visible
//   const [selectedProjects, setSelectedProjects] = useState(new Set());
//   const [assignedProjectsSet, setAssignedProjectsSet] = useState(new Set());
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [projectQuery, setProjectQuery] = useState("");

//   // track sidebar collapsed state so main content margin adjusts
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(
//     localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
//   );

//   // -----------------------
//   // Load initial data
//   // -----------------------
//   useEffect(() => {
//     async function loadData() {
//       setLoading(true);
//       setError("");
//       try {
//         const res = await chargeCodeService.getChargeCodeData();
//         setClients(res?.clients || []);
//         setClientProjects(res?.client_projects || {});
//         setAssignedProjectsSet(new Set(res?.assigned_projects || []));
//         // keep no client selected initially
//         setSelectedClient(null);
//         setSelectedProjects(new Set());
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load clients and projects.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadData();
//   }, []);

//   // listen for sidebar toggle events (same-tab custom event or storage event from other tabs)
//   useEffect(() => {
//     const handler = () => {
//       setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
//     };
//     window.addEventListener("td_sidebar_change", handler);
//     window.addEventListener("storage", handler);
//     return () => {
//       window.removeEventListener("td_sidebar_change", handler);
//       window.removeEventListener("storage", handler);
//     };
//   }, []);

//   // -----------------------
//   // Client selection
//   // -----------------------
//   // When user clicks a client, show its projects and pre-check assigned ones
//   const handleClientSelect = (clientID) => {
//     setSelectedClient(clientID);
//     setProjectQuery("");
//     const list = clientProjects[clientID] || [];
//     const idsForClient = new Set(list.map((p) => p.id));
//     const preChecked = new Set();
//     for (const id of assignedProjectsSet) {
//       if (idsForClient.has(id)) preChecked.add(id);
//     }
//     setSelectedProjects(preChecked);
//     setSuccess("");
//     setError("");
//   };

//   // -----------------------
//   // Project selection helpers
//   // -----------------------
//   const toggleProject = (id) =>
//     setSelectedProjects((prev) => {
//       const nxt = new Set(prev);
//       nxt.has(id) ? nxt.delete(id) : nxt.add(id);
//       return nxt;
//     });

//   const selectAllForClient = () => {
//     const list = clientProjects[selectedClient] || [];
//     setSelectedProjects(new Set(list.map((p) => p.id)));
//   };

//   const clearSelectionForClient = () => setSelectedProjects(new Set());

//   // Filter projects by query (memoized)
//   const filteredProjects = useMemo(() => {
//     if (!selectedClient) return [];
//     const list = clientProjects[selectedClient] || [];
//     const q = projectQuery.trim().toLowerCase();
//     if (!q) return list;
//     return list.filter(
//       (p) =>
//         (p.name || "").toLowerCase().includes(q) ||
//         (p.code || "").toLowerCase().includes(q)
//     );
//   }, [clientProjects, selectedClient, projectQuery]);

//   // -----------------------
//   // Persist changes
//   // -----------------------
//   const handleUpdate = async () => {
//     if (!selectedClient) return;
//     setSaving(true);
//     setError("");
//     setSuccess("");
//     try {
//       // Replace this client's ids in the global assigned set
//       const list = clientProjects[selectedClient] || [];
//       const projectIdsForClient = new Set(list.map((p) => p.id));

//       const nextAssigned = new Set(assignedProjectsSet);
//       for (const id of projectIdsForClient) nextAssigned.delete(id);
//       for (const id of selectedProjects) nextAssigned.add(id);

//       // Send to API
//       await chargeCodeService.updateProjects({ project_ids: [...nextAssigned] });

//       // Update local assigned set after successful save
//       setAssignedProjectsSet(nextAssigned);
//       setSuccess("Project assignments updated successfully.");
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update assignments. Try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // -----------------------
//   // Reset / reload data
//   // -----------------------
//   const handleReset = async () => {
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     try {
//       const res = await chargeCodeService.getChargeCodeData();
//       setClients(res?.clients || []);
//       setClientProjects(res?.client_projects || {});
//       setAssignedProjectsSet(new Set(res?.assigned_projects || []));
//       setSelectedClient(null);
//       setSelectedProjects(new Set());
//       setProjectQuery("");
//     } catch (err) {
//       console.error(err);
//       setError("Failed to reload data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -----------------------
//   // Toast auto-hide
//   // -----------------------
//   useEffect(() => {
//     let t;
//     if (success || error) {
//       t = setTimeout(() => {
//         setSuccess("");
//         setError("");
//       }, 3500); // 3.5s
//     }
//     return () => clearTimeout(t);
//   }, [success, error]);

//   // -----------------------
//   // Toast component (inline)
//   // -----------------------
//   const Toast = ({ type = "success", message = "", onClose }) => {
//     if (!message) return null;
//     const bg =
//       type === "success"
//         ? "bg-white border-l-4 border-green-500"
//         : "bg-white border-l-4 border-rose-500";
//     const icon =
//       type === "success" ? (
//         <FiCheckCircle className="text-green-500" />
//       ) : (
//         <FiX className="text-rose-500" />
//       );
//     return (
//       <div className={`pointer-events-auto ${bg} shadow-md rounded-md p-3 max-w-sm w-full flex items-start gap-3`}>
//         <div className="mt-0.5">{icon}</div>
//         <div className="flex-1">
//           <div className="text-sm font-medium text-slate-800">{type === "success" ? "Success" : "Error"}</div>
//           <div className="text-xs text-slate-600 mt-0.5">{message}</div>
//         </div>
//         <button onClick={onClose} className="text-slate-400 hover:text-slate-700 ml-2">
//           <FiX />
//         </button>
//       </div>
//     );
//   };

//   // compute main margin:
//   // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
//   // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
//   const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

//   // -----------------------
//   // Render
//   // -----------------------
//   return (
//     <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
//       <UserDashboardSidebar />

//       <main className={`flex-1 px-6 md:px-10 py-8 transition-all duration-200 ${mainMarginClass}`}>
//         <div className="max-w-6xl w-full mx-auto space-y-6">
//           {/* HEADER GRADIENT CARD */}
//           <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] rounded-3xl p-[2px] shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
//             <div className="bg-white rounded-[20px] px-6 py-6 flex items-center gap-4">
//               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
//                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
//                   <path d="M7 11H17" stroke="#4C6FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-100">Projects</p>
//                 <h2 className="text-lg md:text-xl font-semibold text-white">Assign Projects in Timesheet</h2>
//                 <p className="text-xs text-white/80 mt-0.5">Select a client and assign projects — matches the style of "Create New Project".</p>
//               </div>
//             </div>
//           </div>

//           {/* MAIN CARD */}
//           <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_14px_35px_rgba(15,23,42,0.08)] p-6">
//             {/* top form row: client select + optional actions (matches AddProject layout) */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-medium text-slate-600 mb-2">
//                   Select Client <span className="text-rose-600">*</span>
//                 </label>
//                 <select
//                   value={selectedClient ?? ""}
//                   onChange={(e) => handleClientSelect(e.target.value || null)}
//                   className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                 >
//                   <option value="">-- Select Client --</option>
//                   {clients.map((c) => (
//                     <option key={c.clientID} value={c.clientID}>
//                       {c.client_name}
//                     </option>
//                   ))}
//                 </select>
//                 <p className="mt-2 text-[11px] text-slate-400">Choose the client to view and assign its projects.</p>
//               </div>

//               <div className="flex items-center gap-3 justify-end">
//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100"
//                 >
//                   <FiRotateCw /> Reset
//                 </button>
//               </div>
//             </div>

//             {/* Toast container (top-right) */}
//             <div className="fixed top-5 right-5 z-50">
//               {success && <Toast type="success" message={success} onClose={() => setSuccess("")} />}
//               {error && (
//                 <div className="mt-3">
//                   <Toast type="error" message={error} onClose={() => setError("")} />
//                 </div>
//               )}
//             </div>

//             {/* When client not selected show placeholder */}
//             {!selectedClient ? (
//               <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500">
//                 <p className="text-lg font-medium">Select a client to view available projects</p>
//                 <p className="text-sm mt-2">Once you select a client, its projects will appear here for selection.</p>
//               </div>
//             ) : (
//               <>
//                 {/* Project controls */}
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
//                   <div className="flex items-center gap-3 w-full md:w-auto">
//                     <div className="relative flex-1 md:flex-none">
//                       <div className="absolute left-3 top-2 text-slate-400 pointer-events-none">
//                         <FiSearch />
//                       </div>
//                       <input
//                         value={projectQuery}
//                         onChange={(e) => setProjectQuery(e.target.value)}
//                         placeholder="Search projects or codes"
//                         className="pl-10 pr-3 py-3 rounded-2xl border border-slate-200 w-full md:w-80 text-sm bg-slate-50 focus:ring-1 focus:ring-[#4C6FFF] outline-none"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       type="button"
//                       onClick={selectAllForClient}
//                       className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium hover:bg-slate-100"
//                     >
//                       Select all
//                     </button>
//                     <button
//                       type="button"
//                       onClick={clearSelectionForClient}
//                       className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-medium hover:bg-slate-50"
//                     >
//                       Clear
//                     </button>
//                   </div>
//                 </div>

//                 {/* Projects list */}
//                 <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-[56vh] overflow-y-auto">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {filteredProjects.length === 0 ? (
//                       <div className="col-span-full p-6 text-center text-slate-400">No projects found for this client.</div>
//                     ) : (
//                       filteredProjects.map((proj) => {
//                         const checked = selectedProjects.has(proj.id);
//                         return (
//                           <label
//                             key={proj.id}
//                             className={`flex items-center justify-between p-3 border rounded-xl transition
//                               ${checked ? "bg-white border-[#e6eeff] shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"}`}
//                           >
//                             <div className="flex items-start gap-3">
//                               <input
//                                 type="checkbox"
//                                 checked={checked}
//                                 onChange={() => toggleProject(proj.id)}
//                                 className="mt-1"
//                               />
//                               <div>
//                                 <div className="text-sm font-medium text-slate-800">{proj.name}</div>
//                                 <div className="text-xs text-slate-400 mt-0.5">{proj.code}</div>
//                               </div>
//                             </div>

//                             <div className="text-xs text-slate-500">{proj.status ?? ""}</div>
//                           </label>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="mt-6 flex items-center justify-end gap-3">
//                   <button
//                     type="button"
//                     onClick={handleReset}
//                     className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100"
//                     disabled={loading}
//                   >
//                     Reset
//                   </button>

//                   <button
//                     type="button"
//                     onClick={handleUpdate}
//                     disabled={saving}
//                     className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium shadow-sm
//                        ${saving ? "bg-slate-300 text-slate-600 cursor-not-allowed" : "bg-[#4C6FFF] hover:bg-[#3f59e0] text-white"}`}
//                   >
//                     {saving ? "Saving…" : "Update Projects"}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }






// src/pages/AddProjectInTimesheet.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import chargeCodeService from "../services/UserDashboard/chargeCodeService";
import UserDashboardSidebar from "./UserDashboardSidebar";
import { FiSearch, FiRotateCw, FiCheckCircle, FiX } from "react-icons/fi";
import logoSmall from "../assets/logo.jpg"; // used as the reset-only logo

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function AddProjectInTimesheet() {
  const [clients, setClients] = useState([]);
  const [clientProjects, setClientProjects] = useState({});
  const [selectedClient, setSelectedClient] = useState(null); // null => only clients visible
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [assignedProjectsSet, setAssignedProjectsSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [projectQuery, setProjectQuery] = useState("");

  // track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  // -----------------------
  // Load initial data
  // -----------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const res = await chargeCodeService.getChargeCodeData();
        setClients(res?.clients || []);
        setClientProjects(res?.client_projects || {});
        setAssignedProjectsSet(new Set(res?.assigned_projects || []));
        // keep no client selected initially
        setSelectedClient(null);
        setSelectedProjects(new Set());
      } catch (err) {
        console.error(err);
        setError("Failed to load clients and projects.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // listen for sidebar toggle events (same-tab custom event or storage event from other tabs)
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

  // -----------------------
  // Client selection
  // -----------------------
  // When user clicks a client, show its projects and pre-check assigned ones
  const handleClientSelect = (clientID) => {
    setSelectedClient(clientID);
    setProjectQuery("");
    const list = clientProjects[clientID] || [];
    const idsForClient = new Set(list.map((p) => p.id));
    const preChecked = new Set();
    for (const id of assignedProjectsSet) {
      if (idsForClient.has(id)) preChecked.add(id);
    }
    setSelectedProjects(preChecked);
    setSuccess("");
    setError("");
  };

  // -----------------------
  // Project selection helpers
  // -----------------------
  const toggleProject = (id) =>
    setSelectedProjects((prev) => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });

  const selectAllForClient = () => {
    const list = clientProjects[selectedClient] || [];
    setSelectedProjects(new Set(list.map((p) => p.id)));
  };

  const clearSelectionForClient = () => setSelectedProjects(new Set());

  // Filter projects by query (memoized)
  const filteredProjects = useMemo(() => {
    if (!selectedClient) return [];
    const list = clientProjects[selectedClient] || [];
    const q = projectQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q)
    );
  }, [clientProjects, selectedClient, projectQuery]);

  // -----------------------
  // Persist changes
  // -----------------------
  const handleUpdate = async () => {
    if (!selectedClient) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Replace this client's ids in the global assigned set
      const list = clientProjects[selectedClient] || [];
      const projectIdsForClient = new Set(list.map((p) => p.id));

      const nextAssigned = new Set(assignedProjectsSet);
      for (const id of projectIdsForClient) nextAssigned.delete(id);
      for (const id of selectedProjects) nextAssigned.add(id);

      // Send to API
      await chargeCodeService.updateProjects({ project_ids: [...nextAssigned] });

      // Update local assigned set after successful save
      setAssignedProjectsSet(nextAssigned);
      setSuccess("Project assignments updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to update assignments. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------
  // Reset / reload data
  // -----------------------
  const handleReset = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await chargeCodeService.getChargeCodeData();
      setClients(res?.clients || []);
      setClientProjects(res?.client_projects || {});
      setAssignedProjectsSet(new Set(res?.assigned_projects || []));
      setSelectedClient(null);
      setSelectedProjects(new Set());
      setProjectQuery("");
    } catch (err) {
      console.error(err);
      setError("Failed to reload data.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Toast auto-hide
  // -----------------------
  useEffect(() => {
    let t;
    if (success || error) {
      t = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3500); // 3.5s
    }
    return () => clearTimeout(t);
  }, [success, error]);

  // -----------------------
  // Toast component (inline)
  // -----------------------
  const Toast = ({ type = "success", message = "", onClose }) => {
    if (!message) return null;
    const bg =
      type === "success"
        ? "bg-white border-l-4 border-green-500"
        : "bg-white border-l-4 border-rose-500";
    const icon =
      type === "success" ? (
        <FiCheckCircle className="text-green-500" />
      ) : (
        <FiX className="text-rose-500" />
      );
    return (
      <div className={`pointer-events-auto ${bg} shadow-md rounded-md p-3 max-w-sm w-full flex items-start gap-3`}>
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-800">{type === "success" ? "Success" : "Error"}</div>
          <div className="text-xs text-slate-600 mt-0.5">{message}</div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 ml-2">
          <FiX />
        </button>
      </div>
    );
  };

  // compute main margin:
  // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
  // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      <UserDashboardSidebar />

      <main className={`flex-1 px-6 md:px-10 py-8 transition-all duration-200 ${mainMarginClass}`}>
        <div className="max-w-6xl w-full mx-auto space-y-6">
          {/* HEADER GRADIENT CARD */}
          <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] rounded-3xl p-[2px] shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="bg-white rounded-[20px] px-6 py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M7 11H17" stroke="#4C6FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-100">Projects</p>
                <h2 className="text-lg md:text-xl font-semibold text-white">Assign Projects in Timesheet</h2>
                <p className="text-xs text-white/80 mt-0.5">Select a client and assign projects — matches the style of "Create New Project".</p>
              </div>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_14px_35px_rgba(15,23,42,0.08)] p-6">
            {/* top form row: client select + optional actions (matches AddProject layout) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Select Client <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedClient ?? ""}
                  onChange={(e) => handleClientSelect(e.target.value || null)}
                  className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.clientID} value={c.clientID}>
                      {c.client_name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-slate-400">Choose the client to view and assign its projects.</p>
              </div>

              <div className="flex items-center gap-3 justify-end">
                {/* RESET button: now shows only the logo (no text). still calls handleReset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Toast container (top-right) */}
            <div className="fixed top-5 right-5 z-50">
              {success && <Toast type="success" message={success} onClose={() => setSuccess("")} />}
              {error && (
                <div className="mt-3">
                  <Toast type="error" message={error} onClose={() => setError("")} />
                </div>
              )}
            </div>

            {/* When client not selected show placeholder */}
            {!selectedClient ? (
              <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500">
                <p className="text-lg font-medium">Select a client to view available projects</p>
                <p className="text-sm mt-2">Once you select a client, its projects will appear here for selection.</p>
              </div>
            ) : (
              <>
                {/* Project controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <div className="absolute left-3 top-2 text-slate-400 pointer-events-none">
                        <FiSearch />
                      </div>
                      <input
                        value={projectQuery}
                        onChange={(e) => setProjectQuery(e.target.value)}
                        placeholder="Search projects or codes"
                        className="pl-10 pr-3 py-3 rounded-2xl border border-slate-200 w-full md:w-80 text-sm bg-slate-50 focus:ring-1 focus:ring-[#4C6FFF] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllForClient}
                      className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectionForClient}
                      className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Projects list */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-[56vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredProjects.length === 0 ? (
                      <div className="col-span-full p-6 text-center text-slate-400">No projects found for this client.</div>
                    ) : (
                      filteredProjects.map((proj) => {
                        const checked = selectedProjects.has(proj.id);
                        return (
                          <label
                            key={proj.id}
                            className={`flex items-center justify-between p-3 border rounded-xl transition
                              ${checked ? "bg-white border-[#e6eeff] shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleProject(proj.id)}
                                className="mt-1"
                              />
                              <div>
                                <div className="text-sm font-medium text-slate-800">{proj.name}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{proj.code}</div>
                              </div>
                            </div>

                            <div className="text-xs text-slate-500">{proj.status ?? ""}</div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  {/* NOTE: Bottom Reset button removed to avoid duplicate reset controls */}
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium shadow-sm
                       ${saving ? "bg-slate-300 text-slate-600 cursor-not-allowed" : "bg-[#4C6FFF] hover:bg-[#3f59e0] text-white"}`}
                  >
                    {saving ? "Saving…" : "Update Projects"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
