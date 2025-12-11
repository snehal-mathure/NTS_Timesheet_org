// // src/pages/AddClient.jsx
// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import PageHeader from "../components/PageHeader";
// import { addClient } from "../services/AdminDashboard/clientservice";

// export default function AddClient() {
//   const [clientName, setClientName] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [dailyHours, setDailyHours] = useState("");
//   const [alert, setAlert] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       client_name: clientName,
//       start_date: startDate,
//       end_date: endDate || null,
//       daily_hours: dailyHours,
//     };

//     try {
//       const response = await addClient(payload);

//       if (response && response.success) {
//         setAlert({ type: "success", message: "Client added successfully!" });
//         setClientName("");
//         setStartDate("");
//         setEndDate("");
//         setDailyHours("");
//       } else {
//         setAlert({
//           type: "error",
//           message: response?.message || "Failed to add client",
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       setAlert({
//         type: "error",
//         message: "Something went wrong. Try again.",
//       });
//     }
//   };

//   const accent = "#4C6FFF";

//   return (
//     <div
//       className="min-h-screen flex"
//       style={{ backgroundColor: "#F5F7FF" }}
//     >
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main content area */}
//       <main className="flex-1 px-4 md:px-10 py-6 md:py-2">
//         <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">
//           {/* Reusable page header */}
//           <PageHeader
//             section="Clients"
//             title="Add New Client"
//             description="Create a new client and configure their project settings."
//             // adjust props if your PageHeader has different API
//           />

//           {/* Card */}
//           <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
//             {/* Card header (no back to dashboard icon now) */}
//             <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//               <div className="flex items-center gap-4">
//                 <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                   <svg
//                     className="w-6 h-6 text-[#4C6FFF]"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                     aria-hidden
//                   >
//                     <rect
//                       x="3"
//                       y="4"
//                       width="18"
//                       height="16"
//                       rx="3"
//                       stroke="currentColor"
//                       strokeWidth="1.6"
//                     />
//                     <path
//                       d="M8 9h8M8 13h5"
//                       stroke="currentColor"
//                       strokeWidth="1.6"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <h2 className="text-base md:text-lg font-semibold text-slate-900">
//                     Client Details
//                   </h2>
//                   <p className="text-xs md:text-sm text-slate-500">
//                     Create a new client and configure their project settings.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Body */}
//             <div className="px-6 py-6 md:py-7">
//               {alert && (
//                 <div
//                   role="status"
//                   className={`rounded-xl px-4 py-3 text-sm mb-5 ${
//                     alert.type === "success"
//                       ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
//                       : "bg-rose-50 text-rose-800 border border-rose-100"
//                   }`}
//                 >
//                   {alert.message}
//                 </div>
//               )}

//               <form
//                 onSubmit={handleSubmit}
//                 className="mt-2 grid grid-cols-1 gap-5"
//               >
//                 <div>
//                   <label
//                     htmlFor="clientName"
//                     className="block text-xs font-semibold text-slate-600 mb-1.5"
//                   >
//                     Client Name <span className="text-rose-500">*</span>
//                   </label>
//                   <input
//                     id="clientName"
//                     type="text"
//                     value={clientName}
//                     onChange={(e) => setClientName(e.target.value)}
//                     required
//                     className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
//                     placeholder="e.g., Acme Corp"
//                     aria-required="true"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label
//                       htmlFor="startDate"
//                       className="block text-xs font-semibold text-slate-600 mb-1.5"
//                     >
//                       Start Date <span className="text-rose-500">*</span>
//                     </label>
//                     <input
//                       id="startDate"
//                       type="date"
//                       value={startDate}
//                       onChange={(e) => setStartDate(e.target.value)}
//                       required
//                       className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
//                       aria-required="true"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="endDate"
//                       className="block text-xs font-semibold text-slate-600 mb-1.5"
//                     >
//                       End Date
//                     </label>
//                     <input
//                       id="endDate"
//                       type="date"
//                       value={endDate}
//                       onChange={(e) => setEndDate(e.target.value)}
//                       className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="dailyHours"
//                     className="block text-xs font-semibold text-slate-600 mb-1.5"
//                   >
//                     Daily Hours <span className="text-rose-500">*</span>
//                   </label>
//                   <div className="flex items-center gap-3">
//                     <input
//                       id="dailyHours"
//                       type="number"
//                       value={dailyHours}
//                       min="0"
//                       max="24"
//                       step="0.5"
//                       onChange={(e) => setDailyHours(e.target.value)}
//                       required
//                       className="block w-40 rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
//                       aria-required="true"
//                     />
//                     <span className="text-xs text-slate-500">hrs / day</span>
//                   </div>
//                   <p className="mt-2 text-xs text-slate-500">
//                     Enter working hours per day (0 – 24). Decimals allowed (e.g.
//                     7.5).
//                   </p>
//                 </div>

//                 <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4">
//                   <Link
//                     to="/viewclient"
//                     className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#e0e4ff] text-xs md:text-sm font-medium text-slate-700 bg-white hover:bg-[#f3f5ff]"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       aria-hidden
//                     >
//                       <path
//                         d="M8 6h11M8 12h11M8 18h11M3 6h.01M3 12h.01M3 18h.01"
//                         stroke="currentColor"
//                         strokeWidth="1.5"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     View All Clients
//                   </Link>

//                   <button
//                     type="submit"
//                     className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold text-white shadow-[0_14px_40px_rgba(76,111,255,0.55)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[rgba(76,111,255,0.35)]"
//                     style={{
//                       background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
//                     }}
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       aria-hidden
//                     >
//                       <path
//                         d="M12 5v14M5 12h14"
//                         stroke="currentColor"
//                         strokeWidth="1.6"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     Add Client
//                   </button>
//                 </div>
//               </form>
//             </div>

//             {/* Card footer */}
//             <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
//               <p className="text-[11px] md:text-xs text-slate-500">
//                 Tip: You can leave{" "}
//                 <span className="font-medium text-slate-600">End Date</span>{" "}
//                 empty for ongoing clients.
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// src/pages/AddClient.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import { addClient } from "../services/AdminDashboard/clientservice";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function AddClient() {
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const payload = {
      client_name: clientName,
      start_date: startDate,
      end_date: endDate || null,
      daily_hours: dailyHours,
    };

    try {
      setSubmitting(true);
      const response = await addClient(payload);

      if (response && response.success) {
        setAlert({ type: "success", message: "Client added successfully!" });
        setClientName("");
        setStartDate("");
        setEndDate("");
        setDailyHours("");
      } else {
        setAlert({
          type: "error",
          message: response?.message || "Failed to add client",
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "Something went wrong. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const accent = "#4C6FFF";

  // main margin classes mirror sidebar widths: collapsed -> md:ml-20 (icons only); expanded -> md:ml-72
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR (independent scroll) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 md:w-72 lg:w-72">
        {/* keep Sidebar component as-is; it handles its own collapsed state */}
        <Sidebar />
      </aside>

      {/* when sidebar collapsed, we want a narrow icon rail. To support that, render same Sidebar for small rail in DOM flow for accessibility */}
      {/* This invisible aside ensures the layout width is correct even when Sidebar component reduces to icon-only visually */}
      <div className="md:hidden">
        {/* mobile handled inside pages/components — our desktop adjustments are via mainMarginClass */}
      </div>

      {/* MAIN CONTENT: shifts right to avoid overlap with fixed sidebar */}
      <main
        className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6 md:py-8`}
        style={{ minHeight: "100vh" }}
      >
        <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">
          {/* Reusable page header */}
          <PageHeader
            section="Clients"
            title="Add New Client"
            description="Create a new client and configure their project settings."
          />

          {/* Card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 text-[#4C6FFF]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900">Client Details</h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Create a new client and configure their project settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 md:py-7">
              {alert && (
                <div
                  role="status"
                  className={`rounded-xl px-4 py-3 text-sm mb-5 ${
                    alert.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      : "bg-rose-50 text-rose-800 border border-rose-100"
                  }`}
                >
                  {alert.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-2 grid grid-cols-1 gap-5">
                <div>
                  <label htmlFor="clientName" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                    placeholder="e.g., Acme Corp"
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-xs font-semibold text-slate-600 mb-1.5">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dailyHours" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Daily Hours <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="dailyHours"
                      type="number"
                      value={dailyHours}
                      min="0"
                      max="24"
                      step="0.5"
                      onChange={(e) => setDailyHours(e.target.value)}
                      required
                      className="block w-40 rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                      aria-required="true"
                    />
                    <span className="text-xs text-slate-500">hrs / day</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Enter working hours per day (0 – 24). Decimals allowed (e.g. 7.5).
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4">
                  <Link
                    to="/viewclient"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#e0e4ff] text-xs md:text-sm font-medium text-slate-700 bg-white hover:bg-[#f3f5ff]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M8 6h11M8 12h11M8 18h11M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    View Clients
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[rgba(76,111,255,0.35)]"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {submitting ? "Saving..." : "Add Client"}
                  </button>

                </div>
              </form>
            </div>

            {/* Card footer */}
            <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
              <p className="text-[11px] md:text-xs text-slate-500">
                Tip: You can leave <span className="font-medium text-slate-600">End Date</span> empty for ongoing clients.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
