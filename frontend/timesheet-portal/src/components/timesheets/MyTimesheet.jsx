


// import React, { useEffect, useState } from "react";
// import {
//   getMyTimesheets,
//   getTimesheetReviewById,
//   downloadTimesheetById,
// } from "../../services/myTimesheetService";


// import TimesheetReviewModal from "./TimesheetReviewModal";
// import UserDashboardSidebar from "../UserDashboardSidebar";

// export default function MyTimesheets() {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [timesheets, setTimesheets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalData, setModalData] = useState(null);

//   useEffect(() => {
//     loadTimesheets();
//   }, []);

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       loadTimesheets();
//     }, 300);

//     return () => clearTimeout(delay);
//   }, [startDate, endDate]);

//   const loadTimesheets = async () => {
//     try {
//       setLoading(true);
//       const data = await getMyTimesheets(startDate, endDate);
//       setTimesheets(data || []);
//     } catch (error) {
//       console.error("Error loading timesheets:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setStartDate("");
//     setEndDate("");
//     loadTimesheets();
//   };

//   const openTimesheetModal = async (id) => {
//     try {
//       const res = await getTimesheetReviewById(id);
//       if (res.success) {
//         setModalData(res);
//         setModalOpen(true);
//       }
//     } catch (err) {
//       console.error("Failed to load timesheet modal:", err);
//     }
//   };

//   return (
//     <div className="relative min-h-screen">

//       {/* EVERYTHING THAT SHOULD BLUR */}
//       <div className={`flex min-h-screen transition-all duration-300 ${modalOpen ? "blur-sm" : ""}`}>

//         <UserDashboardSidebar/>

//         <div className="p-10 bg-[#F8FAFC] flex-1">

//           <h1 className="text-3xl font-bold mb-6 text-gray-800">📅 My Timesheets</h1>

//           {/* FILTER SECTION */}
//           <div className="bg-white shadow-lg rounded-xl p-6 mb-8 flex flex-wrap gap-6 items-end">
//             <div>
//               <label className="block text-gray-600 text-sm mb-1">Start Date</label>
//               <input
//                 type="date"
//                 className="border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-200"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </div>

//             <div>
//               <label className="block text-gray-600 text-sm mb-1">End Date</label>
//               <input
//                 type="date"
//                 className="border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-200"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>

//             <button
//               onClick={handleReset}
//               className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
//             >
//               Reset
//             </button>
//           </div>

//           {/* TABLE */}
//           <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
//             {loading ? (
//               <div className="text-center py-10 text-gray-600">Loading...</div>
//             ) : timesheets.length === 0 ? (
//               <div className="text-center py-10 text-gray-500">
//                 No timesheets found.
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-center border-collapse">
//                   <thead className="bg-blue-50 sticky top-0 shadow-sm">
//                     <tr className="text-gray-700">
//                       <th className="p-3 border">ID</th>
//                       <th className="p-3 border">Week</th>
//                       <th className="p-3 border">Submitted On</th>
//                       <th className="p-3 border">Status</th>
//                       <th className="p-3 border">Actions</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {timesheets.map((t, index) => (
//                       <tr
//                         key={t.id}
//                         className={`border-b hover:bg-blue-50 transition ${
//                           index % 2 === 0 ? "bg-gray-50" : "bg-white"
//                         }`}
//                       >
//                         <td className="p-3 font-semibold text-gray-700">#{t.id}</td>
//                         <td className="p-3">
//                           {t.week_start_date} → {t.week_end_date}
//                         </td>
//                         <td className="p-3 text-gray-600">
//                           {t.submitted_date || "—"}
//                         </td>

//                         <td className="p-3">
//                           <span
//                             className={`px-3 py-1 rounded-xl text-white text-sm ${
//                               t.status === "Approved"
//                                 ? "bg-green-600"
//                                 : t.status === "Submitted"
//                                 ? "bg-blue-600"
//                                 : "bg-gray-600"
//                             }`}
//                           >
//                             {t.status}
//                           </span>
//                         </td>

//                         <td className="p-3 flex justify-center gap-3">
//                           <button
//                             onClick={() => openTimesheetModal(t.id)}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
//                           >
//                             View
//                           </button>

//                           <button
//                             onClick={() => downloadTimesheetById(t.id)}
//                             className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
//                           >
//                             Download
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* MODAL OUTSIDE BLUR */}
//       <TimesheetReviewModal
//         isOpen={modalOpen}
//         data={modalData}
//         onClose={() => setModalOpen(false)}
//       />
//     </div>
//   );
// }

// src/pages/MyTimesheets.jsx
// src/pages/MyTimesheets.jsx
import React, { useEffect, useState } from "react";
import {
  getMyTimesheets,
  getTimesheetReviewById,
  downloadTimesheetById,
} from "../../services/myTimesheetService";

import TimesheetReviewModal from "./TimesheetReviewModal";
import UserDashboardSidebar from "../UserDashboardSidebar";

const SIDEBAR_KEY = "td_sidebar_collapsed";

export default function MyTimesheets() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // track collapsed state from localStorage (keeps layout in sync)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  useEffect(() => {
    loadTimesheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadTimesheets();
    }, 300);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    // listen to storage events (other tabs) and custom event (same tab)
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) {
        setSidebarCollapsed(e.newValue === "true");
      }
    };
    const onCustom = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("td_sidebar_change", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("td_sidebar_change", onCustom);
    };
  }, []);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const data = await getMyTimesheets(startDate, endDate);
      setTimesheets(data || []);
    } catch (error) {
      console.error("Error loading timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    loadTimesheets();
  };

  const openTimesheetModal = async (id) => {
    try {
      const res = await getTimesheetReviewById(id);
      if (res && res.success) {
        setModalData(res);
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load timesheet modal:", err);
    }
  };

  // compute main margin responsive to sidebarCollapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  // layout classes responsive to sidebarCollapsed
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* Sidebar */}
      <UserDashboardSidebar />

      {/* Main content: independent scroll area */}
      <main
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${mainMarginClass} px-6 md:px-10 py-8`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "#17408A" }}
              >
                📅 My Timesheets
              </h1>
              <p className="text-sm mt-1" style={{ color: "#6b7b99" }}>
                View and download your weekly timesheets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* top-right controls placeholder */}
            </div>
          </div>

          {/* Filter card */}
          <div className="bg-white/95 border border-[#e9eefb] rounded-2xl shadow-[0_20px_40px_rgba(15,23,42,0.04)] p-6 flex flex-wrap gap-6 items-end">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6b7b99" }}>
                Start Date
              </label>
              <input
                type="date"
                className="mt-1 block w-44 rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:outline-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(76,111,255,0.06)", outlineColor: "#CFE0FF" }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6b7b99" }}>
                End Date
              </label>
              <input
                type="date"
                className="mt-1 block w-44 rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:outline-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(76,111,255,0.06)", outlineColor: "#CFE0FF" }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm"
                style={{ color: "#1f3b66" }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white/95 border border-[#e9eefb] rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
            {loading ? (
              <div className="text-center py-10" style={{ color: "#6b7b99" }}>
                Loading...
              </div>
            ) : timesheets.length === 0 ? (
              <div className="text-center py-10" style={{ color: "#6b7b99" }}>
                No timesheets found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-slate-100">
                  <thead
                    className="sticky top-0 z-10"
                    style={{ backgroundColor: "#D7E9FF" }}
                  >
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#17408A" }}>
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#17408A" }}>
                        Week
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#17408A" }}>
                        Submitted On
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#17408A" }}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#17408A" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-slate-100">
                    {timesheets.map((t, index) => (
                      <tr
                        key={t.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#EAF4FF] transition`}
                      >
                        <td className="px-4 py-4 font-semibold" style={{ color: "#17408A" }}>
                          #{t.id}
                        </td>
                        <td className="px-4 py-4" style={{ color: "#1f3b66" }}>
                          {t.week_start_date} → {t.week_end_date}
                        </td>
                        <td className="px-4 py-4" style={{ color: "#6b7b99" }}>
                          {t.submitted_date || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background:
                                t.status === "Approved"
                                  ? "#DFF6EA"
                                  : t.status === "Submitted"
                                  ? "#E6F0FF"
                                  : "#EEF2FF",
                              color:
                                t.status === "Approved"
                                  ? "#1f6f3a"
                                  : t.status === "Submitted"
                                  ? "#17408A"
                                  : "#17408A",
                            }}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3 justify-center">
                            <button
                              onClick={() => openTimesheetModal(t.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium shadow"
                              style={{
                                background: "linear-gradient(90deg,#4C6FFF,#6C5CE7)",
                                color: "white",
                              }}
                            >
                              View
                            </button>

                            <button
                              onClick={() => downloadTimesheetById(t.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium shadow"
                              style={{
                                background: "linear-gradient(90deg,#18A058,#2FBF7E)",
                                color: "white",
                              }}
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal (rendered outside blur area) */}
      <TimesheetReviewModal
        isOpen={modalOpen}
        data={modalData}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
