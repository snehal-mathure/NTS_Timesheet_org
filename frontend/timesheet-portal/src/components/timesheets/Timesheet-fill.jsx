


// // src/pages/TimesheetDashboard.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { getDashboardData } from "../../services/dashboardService";
// import { getUserClients, getUserProjects, saveTimesheet } from "../../services/timesheet_fill_service";
// import UserDashboardSidebar from "../UserDashboardSidebar";

// // Helper: convert JS date → YYYY-MM-DD
// const formatDate = (date) => date.toISOString().split("T")[0];

// // Helper: Get Monday of the week
// const getMonday = (d) => {
//   d = new Date(d);
//   const day = d.getDay();
//   const diff = d.getDate() - day + (day === 0 ? -6 : 1);
//   return new Date(d.setDate(diff));
// };

// // Create an empty row template
// const createEmptyRow = () => ({
//   client: "",
//   project: "",
//   hours: {
//     mon: "",
//     tue: "",
//     wed: "",
//     thu: "",
//     fri: "",
//     sat: "",
//     sun: "",
//   },
//   locked: false,
// });

// const SIDEBAR_KEY = "td_sidebar_collapsed";

// export default function TimesheetDashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const urlWeekStart = queryParams.get("week_start_date"); // e.g. "2025-02-20"
//   const urlEdit = queryParams.get("edit"); // (unused in logic but preserved)

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Dynamic week start (always Monday)
//   const [weekStart, setWeekStart] = useState(urlWeekStart ? new Date(urlWeekStart) : getMonday(new Date()));

//   // Dropdown API data
//   const [clients, setClients] = useState([]);
//   const [projectsByRow, setProjectsByRow] = useState({});

//   // Track unsaved changes
//   const [isDirty, setIsDirty] = useState(false);

//   // Default 5 rows
//   const [rows, setRows] = useState([
//     createEmptyRow(),
//     createEmptyRow(),
//     createEmptyRow(),
//     createEmptyRow(),
//     createEmptyRow(),
//   ]);

//   // track collapsed state from localStorage so main content margin adjusts
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");

//   // Reset rows back to original 5 empty rows
//   const resetRows = () => {
//     setIsDirty(false);

//     const newRows = rows.map((r) => {
//       if (r.locked) {
//         // 🔒 KEEP EVERYTHING for locked rows
//         return { ...r };
//       }

//       // 🔓 Reset only unlocked rows
//       return {
//         client: "",
//         project: "",
//         hours: {
//           mon: "",
//           tue: "",
//           wed: "",
//           thu: "",
//           fri: "",
//           sat: "",
//           sun: "",
//         },
//         locked: false,
//       };
//     });

//     // Keep projectsByRow for LOCKED rows so project dropdown doesn't reset
//     const newProjectsByRow = {};
//     rows.forEach((r, index) => {
//       if (r.locked) {
//         newProjectsByRow[index] = projectsByRow[index] || [];
//       }
//     });

//     setRows(newRows);
//     setProjectsByRow(newProjectsByRow);
//   };

//   // Whenever weekStart changes, reload clients & dashboard (clients first)
//   useEffect(() => {
//     loadDropdownDataAndDashboard();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [weekStart]);

//   // If URL changes (for example user clicked Back to Edit and URL contains week_start_date),
//   // update weekStart so dashboard will load that week.
//   useEffect(() => {
//     const qp = new URLSearchParams(location.search);
//     const ws = qp.get("week_start_date");
//     if (ws) {
//       const d = new Date(ws);
//       // only update state if different to avoid refetch loops
//       if (d.toISOString().split("T")[0] !== weekStart.toISOString().split("T")[0]) {
//         setWeekStart(d);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.search]);

//   // listen for sidebar toggle events (same-tab custom event 'td_sidebar_change' or storage from other tabs)
//   useEffect(() => {
//     const handler = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
//     window.addEventListener("td_sidebar_change", handler);
//     const onStorage = (e) => {
//       if (e?.key === SIDEBAR_KEY) handler();
//     };
//     window.addEventListener("storage", onStorage);

//     return () => {
//       window.removeEventListener("td_sidebar_change", handler);
//       window.removeEventListener("storage", onStorage);
//     };
//   }, []);

//   // Load clients first, then dashboard (so we can map client_name -> client.id)
//   const loadDropdownDataAndDashboard = async () => {
//     setLoading(true);
//     try {
//       const clientData = await getUserClients();
//       // Expect clientData = [{ id, client_name, ... }, ...]
//       setClients(clientData || []);

//       // Now fetch dashboard and pass clients so we can map client names to ids
//       await loadDashboard(formatDate(weekStart), clientData || []);
//     } catch (err) {
//       console.error("Error fetching clients or dashboard:", err);
//       setLoading(false);
//     }
//   };

//   // Fetch dashboard data and prefill rows
//   const loadDashboard = async (weekStartDate, clientList = []) => {
//     try {
//       const response = await getDashboardData(weekStartDate);
//       // Your backend returns { status: "success", data: { ..., rows: [...] } }
//       const backend = response.data || response; // handle both shapes safely
//       const payload = backend.data || backend; // in case response.data.data used

//       setData(payload);
//       setLoading(false);

//       // If backend provides rows -> prefill
//       const backendRowsRaw = (payload && payload.rows) || [];

//       if (Array.isArray(backendRowsRaw) && backendRowsRaw.length > 0) {
//         // 1️⃣ FILTER OUT ROWS THAT HAVE ALL ZERO HOURS
//         let filteredRows = backendRowsRaw.filter((r) => {
//           const h = r.hours || {};
//           return Object.values(h).some((val) => parseFloat(val) > 0);
//         });

//         // 2️⃣ MAP ONLY FILTERED ROWS TO clientId + project + hours
//         const mapped = filteredRows.map((r) => {
//           const clientId =
//             (clientList.find(
//               (c) =>
//                 String(c.client_name).trim().toLowerCase() ===
//                 String(r.client_name).trim().toLowerCase()
//             ) || {}).id || "";

//           return {
//             client: clientId,
//             project: r.project_name || "",
//             hours: {
//               mon: r.hours?.mon ?? "",
//               tue: r.hours?.tue ?? "",
//               wed: r.hours?.wed ?? "",
//               thu: r.hours?.thu ?? "",
//               fri: r.hours?.fri ?? "",
//               sat: r.hours?.sat ?? "",
//               sun: r.hours?.sun ?? "",
//             },
//             locked: payload.ts_status === "Submitted",
//           };
//         });

//         // 3️⃣ ALWAYS KEEP 5 ROWS MINIMUM
//         let finalRows = [...mapped];
//         while (finalRows.length < 5) finalRows.push(createEmptyRow());

//         setRows(finalRows);

//         // 4️⃣ LOAD PROJECTS ONLY FOR FILLED ROWS
//         finalRows.forEach(async (row, idx) => {
//           if (row.client) {
//             try {
//               const projects = await getUserProjects(row.client);
//               setProjectsByRow((prev) => ({ ...prev, [idx]: projects || [] }));
//             } catch (e) {
//               console.error("Project load error for row", idx, e);
//             }
//           }
//         });

//         setIsDirty(false);
//         return;
//       }

//       // No saved rows -> keep default 5 empty rows
//       setRows((prev) => {
//         if (!prev || prev.length < 5) {
//           const copy = prev ? [...prev] : [];
//           while (copy.length < 5) copy.push(createEmptyRow());
//           return copy;
//         }
//         return prev;
//       });
//     } catch (err) {
//       console.error("Error loading dashboard:", err);
//       setLoading(false);
//     }
//   };

//   // Update client/project selection
//   const handleRowChange = async (index, field, value) => {
//     setIsDirty(true);

//     const updatedRows = [...rows];
//     updatedRows[index] = { ...updatedRows[index], [field]: value };

//     // If user selected a client -> fetch projects for THAT row only
//     if (field === "client") {
//       updatedRows[index].project = ""; // reset selected project

//       // clear any existing projects for this row while fetching
//       setProjectsByRow((prev) => ({ ...prev, [index]: [] }));

//       try {
//         if (value) {
//           const projectList = await getUserProjects(value); // value = clientID
//           setProjectsByRow((prev) => ({
//             ...prev,
//             [index]: projectList || [],
//           }));
//         }
//       } catch (err) {
//         console.error("Error fetching projects for selected client:", err);
//       }
//     }

//     setRows(updatedRows);
//   };

//   // Update hours
//   const handleHourChange = (index, day, value) => {
//     setIsDirty(true);
//     const updated = [...rows];
//     updated[index] = {
//       ...updated[index],
//       hours: { ...updated[index].hours, [day]: value },
//     };
//     setRows(updated);
//   };

//   // Add new row
//   const addRow = () => {
//     setIsDirty(true);
//     setRows((prev) => [...prev, createEmptyRow()]);
//   };

//   // Confirm navigation if unsaved
//   const confirmNavigate = (callback) => {
//     if (isDirty) {
//       const proceed = window.confirm("You have unsaved changes. Do you want to continue without saving?");
//       if (!proceed) return;
//     }
//     setIsDirty(false);
//     callback();
//   };

//   const handleSaveAndReview = async () => {
//     try {
//       const result = await saveTimesheet(formatDate(weekStart), rows);
//       console.log("Saved timesheet result:", result);

//       if (result.redirect_to) {
//         try {
//           const u = new URL(result.redirect_to, window.location.origin);
//           navigate(u.pathname + u.search);
//         } catch {
//           navigate(result.redirect_to);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving timesheet");
//     }
//   };

//   if (loading || !data) return <div className="text-center p-10">Loading...</div>;

//   const { emp_name } = data;
//   const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

//   // compute main margin responsive to sidebarCollapsed
//   const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

//   return (
//     <div className="flex min-h-screen">
//       <UserDashboardSidebar />

//       {/* Main Content */}
//       <main className={`flex-1 bg-[#F5F7FF] p-10 transition-all duration-200 ${mainMarginClass}`}>
//         {/* Header */}
//         <div className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Weekly Timesheet</h1>
//             <p className="text-gray-500">Employee: {emp_name}</p>
//           </div>
//           <button className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center">
//             <i className="fas fa-user text-gray-600" />
//           </button>
//         </div>

//         {/* Week Selector */}
//         <div className="flex items-center justify-center gap-4 mb-10">
//           {/* Prev Week */}
//           <button
//             className="px-4 py-2 bg-white rounded-xl shadow hover:bg-blue-100"
//             onClick={() =>
//               confirmNavigate(() => {
//                 const prev = new Date(weekStart);
//                 prev.setDate(prev.getDate() - 7);
//                 setWeekStart(prev);
//               })
//             }
//           >
//             &lt;
//           </button>

//           {/* Date Range */}
//           <div className="bg-white px-6 py-3 rounded-xl shadow text-gray-700 font-semibold">
//             {formatDate(weekStart)} → {formatDate(weekEnd)}
//           </div>

//           {/* Next Week */}
//           <button
//             className="px-4 py-2 bg-white rounded-xl shadow hover:bg-blue-100"
//             onClick={() =>
//               confirmNavigate(() => {
//                 const next = new Date(weekStart);
//                 next.setDate(next.getDate() + 7);
//                 setWeekStart(next);
//               })
//             }
//           >
//             &gt;
//           </button>
//         </div>

//         {/* Timesheet Table */}
//         <div className="bg-white rounded-3xl shadow-lg p-6">
//           <table className="w-full text-center">
//             <thead>
//               <tr className="text-gray-700 font-semibold">
//                 <th className="p-3">Client</th>
//                 <th className="p-3">Project</th>
//                 <th className="p-3">Mon</th>
//                 <th className="p-3">Tue</th>
//                 <th className="p-3">Wed</th>
//                 <th className="p-3">Thu</th>
//                 <th className="p-3">Fri</th>
//                 <th className="p-3 bg-yellow-100">Sat</th>
//                 <th className="p-3 bg-yellow-100">Sun</th>
//                 <th className="p-3">Total</th>
//               </tr>
//             </thead>

//             <tbody>
//               {rows.map((row, idx) => {
//                 const rowTotal = Object.values(row.hours).reduce((sum, h) => sum + (parseFloat(h) || 0), 0);

//                 return (
//                   <tr key={idx} className="bg-[#F8FAFF] hover:bg-blue-50 transition">
//                     {/* CLIENT DROPDOWN */}
//                     <td className="p-3">
//                       <select
//                         disabled={row.locked}
//                         className={`w-full border rounded-xl p-2 shadow ${row.locked ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
//                         value={row.client}
//                         onChange={(e) => handleRowChange(idx, "client", e.target.value)}
//                       >
//                         <option value="">Select Client</option>
//                         {clients.map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.client_name}
//                           </option>
//                         ))}
//                       </select>
//                     </td>

//                     {/* PROJECT DROPDOWN */}
//                     <td className="p-3">
//                       <select
//                         disabled={row.locked || !row.client}
//                         className={`w-full border rounded-xl p-2 shadow ${row.locked ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
//                         value={row.project}
//                         onChange={(e) => handleRowChange(idx, "project", e.target.value)}
//                       >
//                         <option value="">Select Project</option>
//                         {(projectsByRow[idx] || []).map((p) => (
//                           <option key={p.id} value={p.project_name}>
//                             {p.project_name}
//                           </option>
//                         ))}
//                       </select>
//                     </td>

//                     {/* WEEKDAY HOURS */}
//                     {["mon", "tue", "wed", "thu", "fri"].map((day) => (
//                       <td key={day} className="p-2">
//                         <input
//                           disabled={row.locked}
//                           type="number"
//                           min="0"
//                           max="24"
//                           step="0.5"
//                           placeholder="0"
//                           className={`w-20 border rounded-xl p-2 shadow ${row.locked ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
//                           value={row.hours[day]}
//                           onChange={(e) => handleHourChange(idx, day, e.target.value)}
//                         />
//                       </td>
//                     ))}

//                     {/* SATURDAY & SUNDAY (Yellow Background) */}
//                     {["sat", "sun"].map((day) => (
//                       <td key={day} className="p-2 bg-yellow-50">
//                         <input
//                           disabled={row.locked}
//                           type="number"
//                           min="0"
//                           max="24"
//                           step="0.5"
//                           placeholder="0"
//                           className={`w-20 border rounded-xl p-2 shadow ${row.locked ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
//                           value={row.hours[day]}
//                           onChange={(e) => handleHourChange(idx, day, e.target.value)}
//                         />
//                       </td>
//                     ))}

//                     {/* ROW TOTAL */}
//                     <td className="font-semibold text-gray-700">{rowTotal}</td>
//                   </tr>
//                 );
//               })}

//               {/* TOTAL SUMMARY ROW */}
//               <tr className="bg-gray-100 font-bold">
//                 <td colSpan="2" className="p-3 text-right">
//                   Weekly Total:
//                 </td>

//                 {/* Daily Totals */}
//                 {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => {
//                   const total = rows.reduce((sum, r) => sum + (parseFloat(r.hours[day]) || 0), 0);

//                   return (
//                     <td key={day} className={`${day === "sat" || day === "sun" ? "bg-yellow-100" : ""} p-3`}>
//                       {total}
//                     </td>
//                   );
//                 })}

//                 {/* Weekly Grand Total */}
//                 <td className="p-3">
//                   {rows.reduce(
//                     (sum, r) => sum + Object.values(r.hours).reduce((s, h) => s + (parseFloat(h) || 0), 0),
//                     0
//                   )}
//                 </td>
//               </tr>

//               {/* ADD + RESET ROW */}
//               <tr>
//                 <td colSpan="10" className="p-4 text-center">
//                   <button onClick={addRow} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow mr-4">
//                     + Add Row
//                   </button>

//                   <button onClick={resetRows} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow">
//                     Reset
//                   </button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Submit */}
//         <div className="mt-10 flex justify-end">
//           <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700" onClick={handleSaveAndReview}>
//             Save & Review
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// }


// src/pages/TimesheetDashboard.jsx
// src/pages/TimesheetDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDashboardData } from "../../services/dashboardService";
import { getUserClients, getUserProjects, saveTimesheet } from "../../services/timesheet_fill_service";
import UserDashboardSidebar from "../UserDashboardSidebar";

// Helper: convert JS date → YYYY-MM-DD
const formatDate = (date) => date.toISOString().split("T")[0];

// Helper: Get Monday of the week
const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Create an empty row template
const createEmptyRow = () => ({
  client: "",
  project: "",
  hours: {
    mon: "",
    tue: "",
    wed: "",
    thu: "",
    fri: "",
    sat: "",
    sun: "",
  },
  locked: false,
});

const SIDEBAR_KEY = "td_sidebar_collapsed";

export default function TimesheetDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlWeekStart = queryParams.get("week_start_date"); // e.g. "2025-02-20"
  const urlEdit = queryParams.get("edit"); // (unused in logic but preserved)

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic week start (always Monday)
  const [weekStart, setWeekStart] = useState(urlWeekStart ? new Date(urlWeekStart) : getMonday(new Date()));

  // Dropdown API data
  const [clients, setClients] = useState([]);
  const [projectsByRow, setProjectsByRow] = useState({});

  // Track unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Default 5 rows
  const [rows, setRows] = useState([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);

  // track collapsed state from localStorage so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");

  // Reset rows back to original 5 empty rows
  const resetRows = () => {
    setIsDirty(false);

    const newRows = rows.map((r) => {
      if (r.locked) {
        // 🔒 KEEP EVERYTHING for locked rows
        return { ...r };
      }

      // 🔓 Reset only unlocked rows
      return {
        client: "",
        project: "",
        hours: {
          mon: "",
          tue: "",
          wed: "",
          thu: "",
          fri: "",
          sat: "",
          sun: "",
        },
        locked: false,
      };
    });

    // Keep projectsByRow for LOCKED rows so project dropdown doesn't reset
    const newProjectsByRow = {};
    rows.forEach((r, index) => {
      if (r.locked) {
        newProjectsByRow[index] = projectsByRow[index] || [];
      }
    });

    setRows(newRows);
    setProjectsByRow(newProjectsByRow);
  };

  // Whenever weekStart changes, reload clients & dashboard (clients first)
  useEffect(() => {
    loadDropdownDataAndDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  // If URL changes (for example user clicked Back to Edit and URL contains week_start_date),
  // update weekStart so dashboard will load that week.
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const ws = qp.get("week_start_date");
    if (ws) {
      const d = new Date(ws);
      // only update state if different to avoid refetch loops
      if (d.toISOString().split("T")[0] !== weekStart.toISOString().split("T")[0]) {
        setWeekStart(d);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // listen for sidebar toggle events (same-tab custom event 'td_sidebar_change' or storage from other tabs)
  useEffect(() => {
    const handler = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    window.addEventListener("td_sidebar_change", handler);
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) handler();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Load clients first, then dashboard (so we can map client_name -> client.id)
  const loadDropdownDataAndDashboard = async () => {
    setLoading(true);
    try {
      const clientData = await getUserClients();
      // Expect clientData = [{ id, client_name, ... }, ...]
      setClients(clientData || []);

      // Now fetch dashboard and pass clients so we can map client names to ids
      await loadDashboard(formatDate(weekStart), clientData || []);
    } catch (err) {
      console.error("Error fetching clients or dashboard:", err);
      setLoading(false);
    }
  };

  // Fetch dashboard data and prefill rows
  const loadDashboard = async (weekStartDate, clientList = []) => {
    try {
      const response = await getDashboardData(weekStartDate);
      // Your backend returns { status: "success", data: { ..., rows: [...] } }
      const backend = response.data || response; // handle both shapes safely
      const payload = backend.data || backend; // in case response.data.data used

      setData(payload);
      setLoading(false);

      // If backend provides rows -> prefill
      const backendRowsRaw = (payload && payload.rows) || [];

      if (Array.isArray(backendRowsRaw) && backendRowsRaw.length > 0) {
        // 1️⃣ FILTER OUT ROWS THAT HAVE ALL ZERO HOURS
        let filteredRows = backendRowsRaw.filter((r) => {
          const h = r.hours || {};
          return Object.values(h).some((val) => parseFloat(val) > 0);
        });

        // 2️⃣ MAP ONLY FILTERED ROWS TO clientId + project + hours
        const mapped = filteredRows.map((r) => {
          const clientId =
            (clientList.find(
              (c) =>
                String(c.client_name).trim().toLowerCase() ===
                String(r.client_name).trim().toLowerCase()
            ) || {}).id || "";

          return {
            client: clientId,
            project: r.project_name || "",
            hours: {
              mon: r.hours?.mon ?? "",
              tue: r.hours?.tue ?? "",
              wed: r.hours?.wed ?? "",
              thu: r.hours?.thu ?? "",
              fri: r.hours?.fri ?? "",
              sat: r.hours?.sat ?? "",
              sun: r.hours?.sun ?? "",
            },
            locked: payload.ts_status === "Submitted",
          };
        });

        // 3️⃣ ALWAYS KEEP 5 ROWS MINIMUM
        let finalRows = [...mapped];
        while (finalRows.length < 5) finalRows.push(createEmptyRow());

        setRows(finalRows);

        // 4️⃣ LOAD PROJECTS ONLY FOR FILLED ROWS
        finalRows.forEach(async (row, idx) => {
          if (row.client) {
            try {
              const projects = await getUserProjects(row.client);
              setProjectsByRow((prev) => ({ ...prev, [idx]: projects || [] }));
            } catch (e) {
              console.error("Project load error for row", idx, e);
            }
          }
        });

        setIsDirty(false);
        return;
      }

      // No saved rows -> keep default 5 empty rows
      setRows((prev) => {
        if (!prev || prev.length < 5) {
          const copy = prev ? [...prev] : [];
          while (copy.length < 5) copy.push(createEmptyRow());
          return copy;
        }
        return prev;
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setLoading(false);
    }
  };

  // Update client/project selection
  const handleRowChange = async (index, field, value) => {
    setIsDirty(true);

    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    // If user selected a client -> fetch projects for THAT row only
    if (field === "client") {
      updatedRows[index].project = ""; // reset selected project

      // clear any existing projects for this row while fetching
      setProjectsByRow((prev) => ({ ...prev, [index]: [] }));

      try {
        if (value) {
          const projectList = await getUserProjects(value); // value = clientID
          setProjectsByRow((prev) => ({
            ...prev,
            [index]: projectList || [],
          }));
        }
      } catch (err) {
        console.error("Error fetching projects for selected client:", err);
      }
    }

    setRows(updatedRows);
  };

  // Update hours
  const handleHourChange = (index, day, value) => {
    setIsDirty(true);
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      hours: { ...updated[index].hours, [day]: value },
    };
    setRows(updated);
  };

  // Add new row
  const addRow = () => {
    setIsDirty(true);
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  // Confirm navigation if unsaved
  const confirmNavigate = (callback) => {
    if (isDirty) {
      const proceed = window.confirm("You have unsaved changes. Do you want to continue without saving?");
      if (!proceed) return;
    }
    setIsDirty(false);
    callback();
  };

  const handleSaveAndReview = async () => {
    try {
      const result = await saveTimesheet(formatDate(weekStart), rows);
      console.log("Saved timesheet result:", result);

      if (result.redirect_to) {
        try {
          const u = new URL(result.redirect_to, window.location.origin);
          navigate(u.pathname + u.search);
        } catch {
          navigate(result.redirect_to);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error saving timesheet");
    }
  };

  if (loading || !data) return <div className="text-center p-10">Loading...</div>;

  const { emp_name } = data;
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

  // compute main margin responsive to sidebarCollapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  // Faint-blue theme colors:
  // headerBg: #E3EEFF  (very light blue)
  // headerAccent: #D7E9FF
  // textAccent: #17408A (soft deep blue for headings)
  return (
    <div className="flex min-h-screen bg-[#F3F6FF]">
      <UserDashboardSidebar />

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all duration-200 ${mainMarginClass}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: "#17408A" }}>Weekly Timesheet</h1>
            <p className="text-sm text-slate-500 mt-1">Employee: <span className="font-medium" style={{ color: "#1f3b66" }}>{emp_name}</span></p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 mr-2">Week</div>
            <div className="flex items-center bg-white rounded-xl shadow px-3 py-2 gap-3">
              <button
                className="px-3 py-1 rounded-md hover:bg-slate-50 transition"
                onClick={() =>
                  confirmNavigate(() => {
                    const prev = new Date(weekStart);
                    prev.setDate(prev.getDate() - 7);
                    setWeekStart(prev);
                  })
                }
                aria-label="Previous week"
              >
                ‹
              </button>

              <div className="text-sm font-medium" style={{ color: "#17408A" }}>
                {formatDate(weekStart)} → {formatDate(weekEnd)}
              </div>

              <button
                className="px-3 py-1 rounded-md hover:bg-slate-50 transition"
                onClick={() =>
                  confirmNavigate(() => {
                    const next = new Date(weekStart);
                    next.setDate(next.getDate() + 7);
                    setWeekStart(next);
                  })
                }
                aria-label="Next week"
              >
                ›
              </button>
            </div>

            <button
              onClick={handleSaveAndReview}
              className="ml-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4C6FFF] to-[#6C5CE7] text-white shadow hover:opacity-95"
            >
              Save & Review
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead style={{ backgroundColor: "#D7E9FF", color: "#17408A" }}>
                  <tr>
                    <th className="w-[16%] p-4 text-left">Client</th>
                    <th className="w-[16%] p-4 text-left">Project</th>
                    <th className="w-[8.5%] p-4">Mon</th>
                    <th className="w-[8.5%] p-4">Tue</th>
                    <th className="w-[8.5%] p-4">Wed</th>
                    <th className="w-[8.5%] p-4">Thu</th>
                    <th className="w-[8.5%] p-4">Fri</th>
                    <th className="w-[8.5%] p-4 bg-[#FEF8E3]" style={{ color: "#17408A" }}>Sat</th>
                    <th className="w-[8.5%] p-4 bg-[#FEF8E3]" style={{ color: "#17408A" }}>Sun</th>
                    <th className="w-[7%] p-4">Total</th>
                  </tr>
                </thead>

                <tbody className="bg-[#FBFDFF]">
                  {rows.map((row, idx) => {
                    const rowTotal = Object.values(row.hours).reduce((sum, h) => sum + (parseFloat(h) || 0), 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        {/* CLIENT DROPDOWN */}
                        <td className="p-3 align-middle">
                          <select
                            disabled={row.locked}
                            className={`w-full border rounded-lg p-2 text-sm ${row.locked ? "bg-gray-100 cursor-not-allowed" : "bg-white"} focus:outline-none focus:ring-2 focus:ring-[#CFE0FF]`}
                            value={row.client}
                            onChange={(e) => handleRowChange(idx, "client", e.target.value)}
                          >
                            <option value="">Select Client</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.client_name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* PROJECT DROPDOWN */}
                        <td className="p-3 align-middle">
                          <select
                            disabled={row.locked || !row.client}
                            className={`w-full border rounded-lg p-2 text-sm ${row.locked ? "bg-gray-100 cursor-not-allowed" : "bg-white"} focus:outline-none focus:ring-2 focus:ring-[#CFE0FF]`}
                            value={row.project}
                            onChange={(e) => handleRowChange(idx, "project", e.target.value)}
                          >
                            <option value="">Select Project</option>
                            {(projectsByRow[idx] || []).map((p) => (
                              <option key={p.id} value={p.project_name}>
                                {p.project_name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* WEEKDAY HOURS */}
                        {["mon", "tue", "wed", "thu", "fri"].map((day) => (
                          <td key={day} className="p-3 align-middle text-center">
                            <input
                              disabled={row.locked}
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              placeholder="0"
                              className={`w-20 border rounded-lg p-2 text-center text-sm ${row.locked ? "bg-gray-100 cursor-not-allowed" : "bg-white"} focus:outline-none focus:ring-2 focus:ring-[#CFE0FF]`}
                              value={row.hours[day]}
                              onChange={(e) => handleHourChange(idx, day, e.target.value)}
                            />
                          </td>
                        ))}

                        {/* SATURDAY & SUNDAY (highlight) */}
                        {["sat", "sun"].map((day) => (
                          <td key={day} className="p-3 align-middle text-center" style={{ backgroundColor: "#FEF8E3" }}>
                            <input
                              disabled={row.locked}
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              placeholder="0"
                              className={`w-20 border rounded-lg p-2 text-center text-sm ${row.locked ? "bg-gray-100 cursor-not-allowed" : "bg-white"} focus:outline-none focus:ring-2 focus:ring-[#FCE9A8]`}
                              value={row.hours[day]}
                              onChange={(e) => handleHourChange(idx, day, e.target.value)}
                            />
                          </td>
                        ))}

                        {/* ROW TOTAL */}
                        <td className="p-3 align-middle text-center">
                          <div className="inline-flex items-center justify-center px-3 py-2 rounded-lg" style={{ backgroundColor: "#EBF3FF", color: "#17408A", fontWeight: 600 }}>
                            {rowTotal.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* TOTAL SUMMARY ROW */}
                  <tr style={{ backgroundColor: "#EBF6FF", fontWeight: 600 }}>
                    <td colSpan="2" className="p-3 text-right" style={{ color: "#17408A" }}>
                      Weekly Total:
                    </td>

                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => {
                      const total = rows.reduce((sum, r) => sum + (parseFloat(r.hours[day]) || 0), 0);

                      return (
                        <td
                          key={day}
                          className={`${day === "sat" || day === "sun" ? "" : ""} p-3 text-center`}
                          style={day === "sat" || day === "sun" ? { backgroundColor: "#FEF8E3", color: "#17408A" } : { color: "#17408A" }}
                        >
                          {total.toFixed(1)}
                        </td>
                      );
                    })}

                    <td className="p-3 text-center" style={{ color: "#17408A" }}>
                      {rows.reduce(
                        (sum, r) => sum + Object.values(r.hours).reduce((s, h) => s + (parseFloat(h) || 0), 0),
                        0
                      ).toFixed(1)}
                    </td>
                  </tr>

                  {/* ADD + RESET ROW */}
                  <tr>
                    <td colSpan="10" className="p-4">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={addRow}
                            className="px-4 py-2 bg-white border border-[#A5D6A7] text-[#0b6b3a] rounded-lg shadow hover:bg-[#F6FFF6] transition"
                          >
                            + Add Row
                          </button>

                          <button
                            onClick={resetRows}
                            className="px-4 py-2 bg-white border border-[#FFC9C9] text-[#8b1f1f] rounded-lg shadow hover:bg-[#FFF6F6] transition"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="text-xs" style={{ color: "#6b7b99" }}>
                          Tip: Weekends are highlighted. Locked rows cannot be edited.
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Small stats / actions row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="bg-white px-4 py-3 rounded-lg shadow border border-slate-100">
                <div className="text-xs" style={{ color: "#6b7b99" }}>Rows</div>
                <div className="font-semibold" style={{ color: "#17408A" }}>{rows.length}</div>
              </div>

              <div className="bg-white px-4 py-3 rounded-lg shadow border border-slate-100">
                <div className="text-xs" style={{ color: "#6b7b99" }}>Grand Total</div>
                <div className="font-semibold" style={{ color: "#17408A" }}>
                  {rows.reduce(
                    (sum, r) => sum + Object.values(r.hours).reduce((s, h) => s + (parseFloat(h) || 0), 0),
                    0
                  ).toFixed(1)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isDirty) {
                    const proceed = window.confirm("You have unsaved changes. Continue?");
                    if (!proceed) return;
                  }
                  handleSaveAndReview();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4C6FFF] to-[#6C5CE7] text-white shadow"
              >
                Save & Review
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
