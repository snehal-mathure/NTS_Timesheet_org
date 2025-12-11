// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// // Services
// import { getReviewTimesheet } from "../../services/TimesheestReviewServices";
// import { submitTimesheetFinal } from "../../services/TimesheestReviewServices";

// import UserDashboardSidebar from "../UserDashboardSidebar";

// export default function TimesheetReview() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Read week_start_date from query params
//   const weekStart = new URLSearchParams(location.search).get("week_start_date");

//   const [loading, setLoading] = useState(true);

//   const [rows, setRows] = useState([]);
//   const [timesheetId, setTimesheetId] = useState(null);

//   const [empName, setEmpName] = useState("");
//   const [weekEnd, setWeekEnd] = useState("");
//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     loadReviewData();
//   }, []);

//   const loadReviewData = async () => {
//     try {
//       const data = await getReviewTimesheet(weekStart);

//       setRows(data.rows);
//       setTimesheetId(data.timesheet_id);

//       setEmpName(data.emp_name);
//       setWeekEnd(data.end_of_week);
//       setStatus(data.ts_status);

//     } catch (error) {
//       console.error("Error loading review timesheet:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       await submitTimesheetFinal(timesheetId, weekStart);
//       alert("Timesheet submitted successfully!");
//       navigate("/dashboard/my_timesheets");
//     } catch (error) {
//       console.error("Error submitting timesheet:", error);
//       alert("Error submitting timesheet.");
//     }
//   };

//   const handleBackToEdit = () => {
//     navigate(`/userdashboard?week_start_date=${weekStart}`);
//   };

//   if (loading) {
//     return <div className="p-10 text-center">Loading review data...</div>;
//   }

//   return (

//     <div className="flex min-h-screen">
//      <UserDashboardSidebar/>
//     <div className="p-10 flex-1">

//       <h1 className="text-2xl font-bold mb-6">Timesheet Review</h1>

//       {/* Employee & Week Details */}
//       <div className="mb-4 text-gray-700">
//         <p>Employee: <strong>{empName}</strong></p>
//         <p>Week: <strong>{weekStart} → {weekEnd}</strong></p>
//         <p>Status: <strong>{status || "Not Submitted"}</strong></p>
//       </div>

//       <div className="bg-white rounded-xl shadow p-6">
//         <table className="w-full text-center">
//           <thead>
//             <tr className="font-semibold bg-gray-100">
//               <th className="p-3">Client</th>
//               <th className="p-3">Project</th>
//               <th className="p-3">Mon</th>
//               <th className="p-3">Tue</th>
//               <th className="p-3">Wed</th>
//               <th className="p-3">Thu</th>
//               <th className="p-3">Fri</th>
//               <th className="p-3 bg-yellow-100">Sat</th>
//               <th className="p-3 bg-yellow-100">Sun</th>
//               <th className="p-3">Total</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, idx) => (
//               <tr key={idx} className="border-b">
//                 <td className="p-3">{row.client_name}</td>
//                 <td className="p-3">{row.project_name}</td>
//                 <td className="p-3">{row.hours.mon}</td>
//                 <td className="p-3">{row.hours.tue}</td>
//                 <td className="p-3">{row.hours.wed}</td>
//                 <td className="p-3">{row.hours.thu}</td>
//                 <td className="p-3">{row.hours.fri}</td>
//                 <td className="p-3 bg-yellow-50">{row.hours.sat}</td>
//                 <td className="p-3 bg-yellow-50">{row.hours.sun}</td>
//                 <td className="p-3 font-semibold">{row.total_hours}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Buttons */}
//       <div className="mt-6 flex justify-between">
        
//         {/* Back to Edit */}
//         <button
//           onClick={handleBackToEdit}
//           className="px-6 py-3 bg-gray-400 text-white rounded-xl shadow hover:bg-gray-500"
//         >
//           Back to Edit
//         </button>

//         {/* Submit */}
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
//         >
//           Submit Timesheet
//         </button>
//       </div>
//     </div>
//     </div>
//   );
// }


// src/pages/TimesheetReview.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Services
import { getReviewTimesheet } from "../../services/TimesheestReviewServices";
import { submitTimesheetFinal } from "../../services/TimesheestReviewServices";

import UserDashboardSidebar from "../UserDashboardSidebar";

const SIDEBAR_KEY = "td_sidebar_collapsed";

export default function TimesheetReview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read week_start_date from query params
  const weekStart = new URLSearchParams(location.search).get("week_start_date");

  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [timesheetId, setTimesheetId] = useState(null);

  const [empName, setEmpName] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [status, setStatus] = useState("");

  // sidebar collapsed state (for layout alignment with sidebar)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  useEffect(() => {
    // listen for same-tab custom event and storage events from other tabs
    const handler = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", (e) => {
      if (e?.key === SIDEBAR_KEY) handler();
    });

    // load data
    loadReviewData();

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReviewData = async () => {
    try {
      const data = await getReviewTimesheet(weekStart);

      setRows(data.rows || []);
      setTimesheetId(data.timesheet_id);

      setEmpName(data.emp_name || "");
      setWeekEnd(data.end_of_week || "");
      setStatus(data.ts_status || "");
    } catch (error) {
      console.error("Error loading review timesheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitTimesheetFinal(timesheetId, weekStart);
      toast.success("Timesheet submitted successfully!");
      navigate("/dashboard/my_timesheets");
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      toast.error("Error submitting timesheet.");
    }
  };

  const handleBackToEdit = () => {
    navigate(`/userdashboard?week_start_date=${weekStart}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-slate-500">Loading review data...</div>
      </div>
    );
  }

  // compute grand total (safe fallback)
  const grandTotal = (rows || []).reduce((acc, r) => {
    if (r.total_hours != null) return acc + Number(r.total_hours || 0);
    const h = r.hours || {};
    return (
      acc +
      (parseFloat(h.mon || 0) || 0) +
      (parseFloat(h.tue || 0) || 0) +
      (parseFloat(h.wed || 0) || 0) +
      (parseFloat(h.thu || 0) || 0) +
      (parseFloat(h.fri || 0) || 0) +
      (parseFloat(h.sat || 0) || 0) +
      (parseFloat(h.sun || 0) || 0)
    );
  }, 0);

  const isAlreadySubmitted =
    String(status).toLowerCase() === "submitted" ||
    String(status).toLowerCase() === "approved";

  // layout margin matches sidebar collapsed/expanded widths used across the app
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="flex min-h-screen bg-[#F3F6FF]">
      <UserDashboardSidebar />

      {/* Main content respects sidebar width so it lines up/overlaps consistently */}
      <main className={`flex-1 p-10 transition-all duration-200 ${mainMarginClass}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Timesheet Review</h1>
            <p className="text-sm text-slate-500 mt-1">
              Employee: <span className="font-medium text-slate-700">{empName}</span>
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Week: <span className="font-medium text-slate-700">{weekStart} → {weekEnd}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">Status</div>
            <div>
              {status ? (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold
                    ${String(status).toLowerCase() === "approved" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                    String(status).toLowerCase() === "submitted" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                    "bg-slate-100 text-slate-700 border border-slate-200"}`}
                >
                  {status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold">
                  Not Submitted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-4 text-left">Client</th>
                  <th className="p-4 text-left">Project</th>
                  <th className="p-3 text-center">Mon</th>
                  <th className="p-3 text-center">Tue</th>
                  <th className="p-3 text-center">Wed</th>
                  <th className="p-3 text-center">Thu</th>
                  <th className="p-3 text-center">Fri</th>
                  <th className="p-3 text-center bg-yellow-50 text-slate-800">Sat</th>
                  <th className="p-3 text-center bg-yellow-50 text-slate-800">Sun</th>
                  <th className="p-3 text-center">Total</th>
                </tr>
              </thead>

              <tbody className="bg-[#FBFDFF]">
                {rows && rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="p-3 text-left">{row.client_name}</td>
                      <td className="p-3 text-left">{row.project_name}</td>
                      <td className="p-3 text-center">{row.hours?.mon ?? 0}</td>
                      <td className="p-3 text-center">{row.hours?.tue ?? 0}</td>
                      <td className="p-3 text-center">{row.hours?.wed ?? 0}</td>
                      <td className="p-3 text-center">{row.hours?.thu ?? 0}</td>
                      <td className="p-3 text-center">{row.hours?.fri ?? 0}</td>
                      <td className="p-3 text-center bg-yellow-50">{row.hours?.sat ?? 0}</td>
                      <td className="p-3 text-center bg-yellow-50">{row.hours?.sun ?? 0}</td>
                      <td className="p-3 text-center font-semibold">{row.total_hours ?? (
                        (Number(row.hours?.mon || 0) +
                          Number(row.hours?.tue || 0) +
                          Number(row.hours?.wed || 0) +
                          Number(row.hours?.thu || 0) +
                          Number(row.hours?.fri || 0) +
                          Number(row.hours?.sat || 0) +
                          Number(row.hours?.sun || 0)).toFixed(1)
                      )}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-6 text-center text-slate-500">
                      No rows to review.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Totals footer */}
              <tfoot className="bg-slate-100">
                <tr className="font-semibold text-slate-800">
                  <td colSpan="2" className="p-3 text-right">Grand Total</td>
                  <td className="p-3 text-center">
                    {rows.reduce((s, r) => s + (Number(r.hours?.mon || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center">
                    {rows.reduce((s, r) => s + (Number(r.hours?.tue || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center">
                    {rows.reduce((s, r) => s + (Number(r.hours?.wed || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center">
                    {rows.reduce((s, r) => s + (Number(r.hours?.thu || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center">
                    {rows.reduce((s, r) => s + (Number(r.hours?.fri || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center bg-yellow-100">
                    {rows.reduce((s, r) => s + (Number(r.hours?.sat || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center bg-yellow-100">
                    {rows.reduce((s, r) => s + (Number(r.hours?.sun || 0)), 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-center">{grandTotal.toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={handleBackToEdit}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl shadow hover:bg-slate-50"
            type="button"
          >
            ← Back to Edit
          </button>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 mr-2">Ready to submit?</div>
            <button
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-xl text-white shadow
                ${isAlreadySubmitted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={isAlreadySubmitted}
              type="button"
            >
              Submit Timesheet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
