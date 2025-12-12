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
      console.log(data)
      console.log("here i am",data.emp_name)
      setRows(data.rows || []);
      setTimesheetId(data.timesheet_id);

      setEmpName(data.emp_name || "");
      setWeekEnd(data.end_of_week || "");
      setStatus(data.ts_status || "");
      console.log("hiii",empName)

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
 const mainMarginClass = sidebarCollapsed ? "md:ml-12" : "md:ml-56";


  // Generate all 7 dates of the selected week
const getWeekDates = (start) => {
  const dates = [];
  const startDate = new Date(start);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
  }
  return dates;
};

// Format to day number only (24, 25, 26...)
const formatDate = (dateStr) => {
  return new Date(dateStr).getDate();
};

const weekDates = getWeekDates(weekStart);


  return (
    <div className="flex min-h-screen bg-[#F3F6FF]">
      <UserDashboardSidebar />

      {/* Main content respects sidebar width so it lines up/overlaps consistently */}
      <main className={`flex-1 p-10 transition-all duration-200 ${mainMarginClass}`}>
        {/* Header */}
        {/* Gradient Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          <div className="
            w-full 
            rounded-2xl 
            bg-gradient-to-r from-[#4C6FFF] to-[#8A7DFF]
            shadow-[0_8px_20px_rgba(76,111,255,0.18)]
            px-5 py-3
            flex items-center gap-3
            text-white
          ">
            <div className="
              w-9 h-9 rounded-xl bg-white/20 
              backdrop-blur-md border border-white/20
              flex items-center justify-center
            ">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.7" />
                <path d="M4 9h16" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </div>

            <h1 className="text-sm md:text-base font-semibold">Timesheet Review</h1>
          </div>
        </div>

              {/* Details Below Header */}
        <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 px-6 py-5 mb-6 space-y-3">

  {/* Employee */}
  <div className="flex items-center gap-2 text-sm">
    <span className="text-slate-500">Employee:</span>
    <span className="text-slate-900 font-semibold">{empName}</span>
  </div>

  {/* Week */}
  <div className="flex items-center gap-2 text-sm">
    <span className="text-slate-500">Week:</span>
    <span className="text-slate-900 font-semibold">
      {weekStart} → {weekEnd}
    </span>
  </div>

  {/* Status */}
  <div className="flex items-center gap-2 text-sm">
    <span className="text-slate-500">Status:</span>
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
        ${
          String(status).toLowerCase() === "approved"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : String(status).toLowerCase() === "submitted"
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "bg-slate-100 text-slate-700 border-slate-300"
        }
      `}
    >
      {status || "Not Submitted"}
    </span>
  </div>

</div>


        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
              {/* HEADER */}
              <thead className="bg-[#F3F5FF]">
                <tr className="text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left font-medium">Client</th>
                  <th className="px-3 py-2 text-left font-medium">Project</th>
                  <th className="px-3 py-2 text-center font-medium">
                      Mon <br /> {formatDate(weekDates[0])}
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Tue <br /> {formatDate(weekDates[1])}
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Wed <br /> {formatDate(weekDates[2])}
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Thu <br /> {formatDate(weekDates[3])}
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Fri <br /> {formatDate(weekDates[4])}
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Sat <br /> {formatDate(weekDates[5])}
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Sun <br /> {formatDate(weekDates[6])}
                    </th>

                  <th className="px-3 py-2 text-center font-medium">Total</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#F8F9FF] transition border-b border-slate-100"
                    >
                      {/* CLIENT */}
                      <td className="px-3 py-2 align-middle">
                        {row.client_name}
                      </td>

                      {/* PROJECT */}
                      <td className="px-3 py-2 align-middle">
                        {row.project_name}
                      </td>

                      {/* WEEKDAY HOURS */}
                      <td className="px-3 py-2 text-center align-middle">{row.hours?.mon ?? 0}</td>
                      <td className="px-3 py-2 text-center align-middle">{row.hours?.tue ?? 0}</td>
                      <td className="px-3 py-2 text-center align-middle">{row.hours?.wed ?? 0}</td>
                      <td className="px-3 py-2 text-center align-middle">{row.hours?.thu ?? 0}</td>
                      <td className="px-3 py-2 text-center align-middle">{row.hours?.fri ?? 0}</td>

                      {/* WEEKENDS */}
                      <td className="px-3 py-2 text-center align-middle bg-yellow-50">
                        {row.hours?.sat ?? 0}
                      </td>
                      <td className="px-3 py-2 text-center align-middle bg-yellow-50">
                        {row.hours?.sun ?? 0}
                      </td>

                      {/* TOTAL */}
                      <td className="px-3 py-2 text-center align-middle font-semibold text-slate-800">
                        {row.total_hours ?? (
                          (
                            Number(row.hours?.mon || 0) +
                            Number(row.hours?.tue || 0) +
                            Number(row.hours?.wed || 0) +
                            Number(row.hours?.thu || 0) +
                            Number(row.hours?.fri || 0) +
                            Number(row.hours?.sat || 0) +
                            Number(row.hours?.sun || 0)
                          ).toFixed(1)
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                      No rows to review.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* FOOTER */}
              <tfoot className="bg-[#F3F5FF] border-t border-slate-200">
                <tr className="font-semibold text-slate-700">
                  <td colSpan="2" className="px-3 py-2 text-right">Grand Total</td>

                  <td className="px-3 py-2 text-center">
                    {rows.reduce((s, r) => s + Number(r.hours?.mon || 0), 0).toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {rows.reduce((s, r) => s + Number(r.hours?.tue || 0), 0).toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {rows.reduce((s, r) => s + Number(r.hours?.wed || 0), 0).toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {rows.reduce((s, r) => s + Number(r.hours?.thu || 0), 0).toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {rows.reduce((s, r) => s + Number(r.hours?.fri || 0), 0).toFixed(1)}
                  </td>

                  <td className="px-3 py-2 text-center bg-yellow-100">
                    {rows.reduce((s, r) => s + Number(r.hours?.sat || 0), 0).toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center bg-yellow-100">
                    {rows.reduce((s, r) => s + Number(r.hours?.sun || 0), 0).toFixed(1)}
                  </td>

                  <td className="px-3 py-2 text-center text-slate-900">
                    {grandTotal.toFixed(1)}
                  </td>
                </tr>
              </tfoot>

            </table>

          </div>
        </div>

        {/* Actions */}
       <div className="mt-6 flex items-center justify-between gap-3">

            {/* Smaller Back Button */}
            <button
              onClick={handleBackToEdit}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 
                        rounded-lg shadow-sm hover:bg-slate-100 text-sm"
              type="button"
            >
              ← Back to Edit
            </button>

            {/* Submit Section */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500 mr-1">Ready to submit?</div>

              {/* Gradient Submit Button */}
              <button
                onClick={handleSubmit}
                className={`
                  px-4 py-2 rounded-lg text-white text-sm font-medium shadow 
                  ${isAlreadySubmitted 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  }`}
                disabled={isAlreadySubmitted}
                type="button"
              >
                Submit 
              </button>
            </div>

          </div>

      </main>
    </div>
  );
}
