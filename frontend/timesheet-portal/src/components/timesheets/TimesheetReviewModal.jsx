// src/components/TimesheetReviewModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function TimesheetReviewModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const navigate = useNavigate();
  const { employee_name, timesheet, day_labels, hours_by_project, total_hours, week_total } = data;
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  // STATUS BADGE COLORS
  const statusColor = {
    Submitted: "bg-blue-500",
    Approved: "bg-green-600",
    Rejected: "bg-red-600",
    "Not Submitted": "bg-gray-500",
  };

  const handleSubmitClick = () => {
    // Navigate to the timesheet review page for that week
    // (keeps internal navigation so SPA state persists)
    if (timesheet && timesheet.week_start_date) {
      navigate(`/dashboard/timesheet_review?week_start_date=${encodeURIComponent(timesheet.week_start_date)}`);
    } else {
      // fallback: close modal if no week info
      onClose?.();
    }
  };

  const isSubmitted = String(timesheet?.status || "").trim() === "Submitted";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* POPUP CARD */}
      <div
        className="
    pointer-events-auto
    fixed
    top-1/2
    left-1/2
    -translate-y-1/2
    -translate-x-[45%]
    backdrop-blur-md
    bg-white
    shadow-lg
    border border-slate-200
    rounded-xl
    p-4
    w-[900px]
    max-w-none
    max-h-[80vh]
    overflow-y-auto
    animate-scaleIn
  "
      >


        {/* HEADER ROW WITH STATUS BADGE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          {/* LEFT SIDE TEXT */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800">Timesheet Review</h2>
            <p className="text-gray-700 text-lg mt-1">{employee_name}</p>
            <p className="text-gray-500 text-sm">
              Week: <strong>{timesheet.week_start_date}</strong> →{" "}
              <strong>{timesheet.week_end_date}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* If not submitted, show a prominent "Click here to submit" button */}
            {!isSubmitted && (
              <button
                onClick={handleSubmitClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow"
                title="Submit this timesheet"
              >
                Click here to submit
              </button>
            )}

            {/* STATUS BADGE */}
            <div
              className={`
                px-4 py-2 rounded-full text-white font-semibold shadow
                ${statusColor[timesheet.status] || "bg-gray-500"}
              `}
            >
              {timesheet.status}
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black text-3xl font-bold ml-2"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-lg">
            {/* TABLE HEADER */}
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 text-sm font-semibold">
                <th rowSpan="2" className="border p-3">Client</th>
                <th rowSpan="2" className="border p-3">Project</th>

                {days.map((d) => (
                  <th key={d} className="border p-3">
                    {day_labels[d].date}
                  </th>
                ))}

                <th rowSpan="2" className="border p-3">Total</th>
              </tr>

              <tr className="bg-blue-50 text-gray-600 text-xs uppercase">
                {days.map((d) => (
                  <th key={d} className="border p-3 tracking-wide">
                    {day_labels[d].label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="text-sm">
              {Object.entries(hours_by_project).map(([code, proj]) => (
                <tr
                  key={code}
                  className="hover:bg-blue-50 transition border-b text-gray-700"
                >
                  <td className="border p-3">{proj.client_name}</td>
                  <td className="border p-3">{proj.project_name}</td>

                  {days.map((d) => (
                    <td key={d} className="border p-3">
                      {proj.hours[d]}
                    </td>
                  ))}

                  <td className="border p-3 font-bold text-gray-900">{proj.total}</td>
                </tr>
              ))}

              {/* DAILY TOTALS */}
              <tr className="bg-gray-200 font-semibold">
                <td colSpan="2" className="border p-3 text-gray-700">
                  Daily Total
                </td>

                {days.map((d) => (
                  <td key={d} className="border p-3 text-gray-700">
                    {total_hours[d]}
                  </td>
                ))}

                <td className="border p-3 text-gray-900">{week_total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ANIMATION CSS */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}