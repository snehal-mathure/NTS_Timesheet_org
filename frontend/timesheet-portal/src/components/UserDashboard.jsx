
// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import UserDashboardSidebar from "../components/UserDashboardSidebar";
import timesheetService from "../services/UserDashboard/timesheetService";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [weekStart, setWeekStart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load timesheet whenever weekStart changes (or on mount)
  useEffect(() => {
    loadTimesheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  async function loadTimesheet() {
    setLoading(true);
    try {
      const res = await timesheetService.getTimesheet(weekStart);
      if (res && res.status === "success" && res.data) {
        const normalized = {
          ...res.data,
          user_id: res.data.user_id || res.data.empid || "",
        };
        setData(normalized);

        // initialize weekStart to server-provided start date if not already set
        if (!weekStart && normalized.start_of_week) {
          setWeekStart(normalized.start_of_week);
        }
      } else {
        console.error("Unexpected response from timesheetService:", res);
        alert("Failed to load timesheet.");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading timesheet.");
    } finally {
      setLoading(false);
    }
  }

  function changeWeek(direction) {
    const base = weekStart || (data && data.start_of_week) || new Date().toISOString().split("T")[0];
    const date = new Date(base);
    date.setDate(date.getDate() + (direction === "prev" ? -7 : 7));
    const newStart = date.toISOString().split("T")[0];
    setWeekStart(newStart);
  }

  async function submitTimesheet(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const json = Object.fromEntries(formData.entries());

    try {
      const res = await timesheetService.saveTimesheet(json);
      if (res && res.status === "success") {
        alert("Timesheet saved!");
        if (res.redirect_to) {
          window.location.href = res.redirect_to;
        } else {
          // Refresh timesheet after successful save
          setWeekStart((w) => w);
          loadTimesheet();
        }
      } else {
        console.error("Save failed:", res);
        alert("Failed to save timesheet.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving timesheet.");
    }
  }

  // Early loading UI
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex">
        <div className="ml-20 md:ml-72 p-10">Loading timesheet…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] flex">
        <div className="ml-20 md:ml-72 p-10">No timesheet data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex">
      {/* Sidebar (fixed on left) */}
      <UserDashboardSidebar isApprover={data.is_approver} userId={data.user_id} />

      {/* MAIN CONTENT
          - pl matches sidebar widths so the content sits to the right of the sidebar
          - flex + justify-center makes the inner column centered within the available space
      */}
      <div className="flex-1 px-4 md:px-8 pt-6 md:pt-8 pl-[90px] md:pl-[300px] transition-all flex justify-center">
        {/* Centered column with controlled max-width */}
        <div className="w-full max-w-4xl space-y-6">
          {/* HEADER CARD */}
          <div className="relative">
            <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] rounded-3xl p-[2px] shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="bg-white rounded-[20px] px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <FiCalendar className="text-slate-900" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    TIMESHEET
                  </p>
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                    Weekly Timesheet — {data.emp_name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">Submit your weekly working hours here.</p>
                </div>
              </div>
            </div>
          </div>

          {/* WEEK SELECTOR CARD */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => changeWeek("prev")}
              className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center"
              aria-label="Previous week"
              type="button"
            >
              <FiChevronLeft />
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-500">Week Range</p>
              <p className="text-sm font-medium text-slate-800">
                {data.start_of_week} → {data.end_of_week}
              </p>
            </div>

            <button
              onClick={() => changeWeek("next")}
              className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center"
              aria-label="Next week"
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>

          {/* TIMESHEET TABLE CARD */}
          <form onSubmit={submitTimesheet}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-center">
                    <th className="p-3 text-left pl-6">Client</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3">Mon</th>
                    <th className="p-3">Tue</th>
                    <th className="p-3">Wed</th>
                    <th className="p-3">Thu</th>
                    <th className="p-3">Fri</th>
                    <th className="p-3">Sat</th>
                    <th className="p-3">Sun</th>
                    <th className="p-3">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {data.rows && data.rows.length ? (
                    data.rows.map((row, i) => (
                      <tr key={i} className="border-b text-center hover:bg-slate-50 transition">
                        <td className="p-3 text-slate-700 text-left pl-6">{row.client_name}</td>
                        <td className="p-3 text-slate-700 text-left">{row.project_name}</td>

                        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                          <td key={day} className="p-2">
                            <input
                              name={`${day}_${i}`}
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              defaultValue={row.hours?.[day] ?? ""}
                              className="w-16 h-9 border border-slate-200 rounded-lg p-1 text-center hover:border-slate-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            />
                          </td>
                        ))}

                        <td className="p-3 font-semibold text-slate-800">{row.total_hours ?? 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-500">
                        No rows found for this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Hidden Fields */}
            <input type="hidden" name="projects_count" value={data.projects_count ?? ""} />
            <input type="hidden" name="week_start_date" value={weekStart ?? data.start_of_week ?? ""} />

            {/* SUBMIT area aligned with cards */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#4C6FFF] hover:bg-[#3d58dc] text-white rounded-full shadow-md text-sm font-medium"
              >
                Save & Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
