
// src/pages/TimesheetDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDashboardData } from "../../services/dashboardService";
import { toast } from "react-toastify";
import {
  getUserClients,
  getUserProjects,
  saveTimesheet,
} from "../../services/timesheet_fill_service";
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
  const [weekStart, setWeekStart] = useState(
    urlWeekStart ? new Date(urlWeekStart) : getMonday(new Date())
  );

  // Dropdown API data
  const [clients, setClients] = useState([]);
  const [projectsByRow, setProjectsByRow] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);


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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_KEY) === "true"
  );

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
  }, [location.search]);

  // listen for sidebar toggle events (same-tab custom event 'td_sidebar_change' or storage from other tabs)
  useEffect(() => {
    const handler = () =>
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
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
      const backend = response.data || response; // handle both shapes safely
      const payload = backend.data || backend; // in case response.data.data used

      setData(payload);
      setLoading(false);
      setHolidays(payload.holidays || []);
      setLeaves(payload.leaves || []);


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
      const proceed = window.confirm(
        "You have unsaved changes. Do you want to continue without saving?"
      );
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
      toast.error("Error saving timesheet");
    }
  };

  if (loading || !data)
    return <div className="text-center p-10">Loading...</div>;

  const { emp_name } = data;
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const weekDates = {
  mon: formatDate(weekStart),
  tue: formatDate(new Date(weekStart.getTime() + 1 * 86400000)),
  wed: formatDate(new Date(weekStart.getTime() + 2 * 86400000)),
  thu: formatDate(new Date(weekStart.getTime() + 3 * 86400000)),
  fri: formatDate(new Date(weekStart.getTime() + 4 * 86400000)),
  sat: formatDate(new Date(weekStart.getTime() + 5 * 86400000)),
  sun: formatDate(new Date(weekStart.getTime() + 6 * 86400000)),
};

  // compute main margin responsive to sidebarCollapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";
  const accent = "#4C6FFF";
  return (
    <div className="flex min-h-screen bg-[#F3F6FF]">
      <UserDashboardSidebar />

      {/* Main Content */}
      <main
        className={`flex-1 p-5 md:p-8 transition-all duration-200 ${mainMarginClass}`}
      >
        {/* Header */}
      {/* Compact Gradient Timesheet Header */}
      
<div className="
  w-full 
  rounded-2xl 
  bg-gradient-to-r from-[#4C6FFF] to-[#8A7DFF]
  shadow-[0_8px_20px_rgba(76,111,255,0.18)]
  px-5 py-3               /* ← REDUCED HEIGHT */
  flex items-center gap-3
  text-white
">
  {/* Icon */}
  <div className="
    w-9 h-9               /* ← SMALLER ICON BOX */
    rounded-xl 
    bg-white/20 
    backdrop-blur-md 
    flex items-center justify-center
    border border-white/20
  ">
    <svg
      className="w-5 h-5 text-white"   /* ← SMALLER ICON */
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.7"
      stroke="currentColor"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16" />
    </svg>
  </div>

  {/* Text */}
  <div className="leading-tight">
    <h1 className="text-sm md:text-base font-semibold"> {/* ← SMALLER FONT */}
      Weekly Timesheet
    </h1>

    <p className="text-[11px] md:text-xs text-white/80"> {/* ← SMALLER SUBTITLE */}
      Employee: <span className="font-medium">{emp_name}</span>
    </p>
  </div>

  {/* Push week nav to right */}
  <div className="flex-1" />

  {/* Week Navigation */}
  <div className="
    flex items-center gap-2 
    bg-white/20 backdrop-blur-md 
    px-2.5 py-1.5            /* ← REDUCED SIZE */
    rounded-xl
    border border-white/20
  ">
    <button
      className="px-2 py-0.5 rounded-md hover:bg-white/20 text-xs"
      onClick={() =>
        confirmNavigate(() => {
          const prev = new Date(weekStart);
          prev.setDate(prev.getDate() - 7);
          setWeekStart(prev);
        })
      }
    >
      ‹
    </button>

    <span className="text-xs font-medium"> {/* ← SMALLER TEXT */}
      {formatDate(weekStart)} → {formatDate(weekEnd)}
    </span>

    <button
      className="px-2 py-0.5 rounded-md hover:bg-white/20 text-xs"
      onClick={() =>
        confirmNavigate(() => {
          const next = new Date(weekStart);
          next.setDate(next.getDate() + 7);
          setWeekStart(next);
        })
      }
    >
      ›
    </button>
  </div>
</div>


        {/* Board */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              {/* compact rows similar to screenshot */}
              <table className="min-w-full table-fixed border-separate border-spacing-y-1.5">
               <thead
  className="text-[12px] md:text-sm bg-[#F3F5FF] text-slate-700"  // <-- GREY HEADER
>
  <tr>
    <th className="w-[16%] p-1.5 text-left font-semibold">Client</th>
    <th className="w-[16%] p-1.5 text-left font-semibold">Project</th>

    {/* Show Day + Date */}
    <th className="w-[8.5%] p-1.5 font-semibold">
      Mon <br /> <span className="text-[10px] text-slate-500">{weekDates.mon}</span>
    </th>
    <th className="w-[8.5%] p-1.5 font-semibold">
      Tue <br /> <span className="text-[10px] text-slate-500">{weekDates.tue}</span>
    </th>
    <th className="w-[8.5%] p-1.5 font-semibold">
      Wed <br /> <span className="text-[10px] text-slate-500">{weekDates.wed}</span>
    </th>
    <th className="w-[8.5%] p-1.5 font-semibold">
      Thu <br /> <span className="text-[10px] text-slate-500">{weekDates.thu}</span>
    </th>
    <th className="w-[8.5%] p-1.5 font-semibold">
      Fri <br /> <span className="text-[10px] text-slate-500">{weekDates.fri}</span>
    </th>
    <th className="w-[8.5%] p-1.5 font-semibold">
      Sat <br /> <span className="text-[10px] text-slate-500">{weekDates.sat}</span>
    </th>
    <th className="w-[8.5%] p-1.5 font-semibold">
      Sun <br /> <span className="text-[10px] text-slate-500">{weekDates.sun}</span>
    </th>

    <th className="w-[7%] p-1.5 font-semibold">Total</th>
  </tr>
</thead>

               <tbody className="bg-white text-[11px] md:text-xs">   



                  {rows.map((row, idx) => {
                    const rowTotal = Object.values(row.hours).reduce(
                      (sum, h) => sum + (parseFloat(h) || 0),
                      0
                    );

                    return (
                      <tr key={idx} className="align-middle">
                        {/* CLIENT DROPDOWN */}
                        <td className="p-1.5 align-middle">
                          <select
                            disabled={row.locked}
                            className={`w-full h-8 rounded-xl px-3 text-xs md:text-sm border ${
                              row.locked
                                ? "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500"
                                : "bg-[#F9FBFF] border-[#D8E3FF] hover:border-slate-300"
                            } focus:outline-none focus:ring-2 focus:ring-[#CFE0FF] focus:border-transparent`}
                            value={row.client}
                            onChange={(e) =>
                              handleRowChange(idx, "client", e.target.value)
                            }
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
                        <td className="p-1.5 align-middle">
                          <select
                            disabled={row.locked || !row.client}
                            className={`w-full h-8 rounded-xl px-3 text-xs md:text-sm border ${
                              row.locked || !row.client
                                ? "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500"
                                : "bg-[#F9FBFF] border-[#D8E3FF] hover:border-slate-300"
                            } focus:outline-none focus:ring-2 focus:ring-[#CFE0FF] focus:border-transparent`}
                            value={row.project}
                            onChange={(e) =>
                              handleRowChange(idx, "project", e.target.value)
                            }
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
                        {["mon", "tue", "wed", "thu", "fri"].map((day) =>{
                        
                        const date = weekDates[day];
                        const isHoliday = holidays.includes(date);
                        const isLeave = leaves.includes(date);

                        let colorClass = "";

                        if (row.locked) {
                          colorClass = "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500";
                        } else if (isHoliday) {
                          colorClass = "bg-[#F3E8FF]  border-[#D9B7FF]"; // holiday red
                        } else if (isLeave) {
                          colorClass = "bg-[#FFF6CC] border-[#FFCC66]"; // leave yellow
                        } else {
                          colorClass = "bg-[#F9FBFF] border-[#D8E3FF] hover:border-slate-300"; // normal day
                        }
                        return(
                          <td
                            key={day}
                            className="p-1.5 align-middle text-center"
                          >
                            <input
                              disabled={row.locked}
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              placeholder="0"
                              className={`w-12 md:w-14 h-8 rounded-xl px-2.5 text-center 
                              text-xs md:text-sm border ${
                                row.locked
                                  ? "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500"
                                  : colorClass
                              }
                              focus:outline-none focus:ring-2 focus:ring-[#CFE0FF] focus:border-transparent`}
                              value={row.hours[day]}
                              onChange={(e) =>
                                handleHourChange(idx, day, e.target.value)
                              }
                            />
                          </td>
                        )
                        })}

                        {/* SATURDAY & SUNDAY */}
                        {["sat", "sun"].map((day) => {
                        const date = weekDates[day];
                        const isHoliday = holidays.includes(date);
                        const isLeave = leaves.includes(date);

                        let colorClass = "";

                        if (isHoliday) {
                          colorClass = "bg-[#FFE5E5] border-[#FF7A7A]"; // holiday red
                        } else if (isLeave) {
                          colorClass = "bg-[#FFF6CC] border-[#FFCC66]"; // leave yellow
                        } else {
                          colorClass = "bg-[#FFF9EC] border-[#F2DCA2]"; // weekend default
                        }

                        return(
                          <td
                            key={day}
                            className="p-1.5 align-middle text-center"
                          >
                            <input
                              disabled={row.locked}
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              placeholder="0"
                               className={`w-12 md:w-14 h-8 rounded-xl px-2.5 text-center 
                                text-xs md:text-sm border ${
                                  row.locked
                                    ? "bg-[#FFF7E8] border-[#F2DCA2] cursor-not-allowed text-slate-500"
                                    : colorClass
                                }
                                focus:outline-none focus:ring-2 focus:ring-[#FCE9A8] focus:border-transparent`}
                              value={row.hours[day]}
                              onChange={(e) =>
                                handleHourChange(idx, day, e.target.value)
                              }
                            />
                          </td>
                        )
                        })}

                        {/* ROW TOTAL */}
                        <td className="p-1.5 align-middle text-center">
                          <input
                            type="text"
                            readOnly
                            value={rowTotal.toFixed(1)}
                            className="
                              w-12 md:w-14 h-8 rounded-xl px-2.5
                              text-center text-xs md:text-sm
                              border border-[#C9D7FF]
                              bg-[#F3F6FF]
                              text-[#17408A] font-semibold
                              cursor-default
                            "
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {/* TOTAL SUMMARY ROW */}
                  <tr
                    style={{ backgroundColor: "#F3F7FF" }}
                    className="font-semibold text-[11px] md:text-xs"
                  >
                    <td
                      colSpan="2"
                      className="p-2.5 text-right"
                      style={{ color: "#17408A" }}
                    >
                      Weekly Total:
                    </td>

                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(
                      (day) => {
                        const total = rows.reduce(
                          (sum, r) =>
                            sum + (parseFloat(r.hours[day]) || 0),
                          0
                        );

                        const isWeekend = day === "sat" || day === "sun";

                        return (
                          <td
                            key={day}
                            className="p-2.5 text-center align-middle"
                          >
                            <input
                              type="text"
                              readOnly
                              value={total.toFixed(1)}
                              className={`
                                w-12 md:w-14 h-8 rounded-xl px-2.5
                                text-center text-xs md:text-sm
                                border
                                ${isWeekend
                                  ? "bg-[#FFF9EC] border-[#F2DCA2]"
                                  : "bg-white border-[#C9D7FF]"
                                }
                                text-[#17408A] font-semibold
                                cursor-default
                              `}
                            />
                          </td>
                        );
                      }
                    )}

                    <td className="p-2.5 text-center align-middle">
                      <div
                        className="
                          w-12 md:w-14 h-8
                          rounded-xl px-2.5
                          text-center
                          leading-none
                          flex items-center justify-center
                          text-xs md:text-sm
                          border border-[#C9D7FF]
                          bg-[#F3F6FF]
                          text-[#17408A] font-semibold
                          cursor-default
                        "
                        style={{ color: "#17408A" }}
                      >
                        {rows
                          .reduce(
                            (sum, r) =>
                              sum +
                              Object.values(r.hours).reduce(
                                (s, h) => s + (parseFloat(h) || 0),
                                0
                              ),
                            0
                          )
                          .toFixed(1)}
                      </div>
                    </td>
                  </tr>

                  {/* ADD + RESET ROW */}
                  <tr>
                    <td colSpan="10" className="p-3">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <button
                            onClick={addRow}
                            className="px-3 md:px-4 py-1.5 rounded-lg bg-white border border-[#A5D6A7] text-[#0b6b3a] text-xs md:text-sm hover:bg-[#F6FFF6] transition"
                          >
                            + Add Row
                          </button>

                          <button
                            onClick={resetRows}
                            className="px-3 md:px-4 py-1.5 rounded-lg bg-white border border-[#FFC9C9] text-[#8b1f1f] text-xs md:text-sm hover:bg-[#FFF6F6] transition"
                          >
                            Reset
                          </button>
                        </div>

                        <div
                          className="text-[11px] md:text-xs"
                          style={{ color: "#6b7b99" }}
                        >
                          Tip: Weekends are highlighted. Locked rows cannot be
                          edited.
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Small stats / actions row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-white px-3 md:px-4 py-2.5 rounded-xl shadow border border-slate-100">
                <div
                  className="text-[11px] md:text-xs"
                  style={{ color: "#6b7b99" }}
                >
                  Rows
                </div>
                <div
                  className="font-semibold text-sm md:text-base"
                  style={{ color: "#17408A" }}
                >
                  {rows.length}
                </div>
              </div>

              <div className="bg-white px-3 md:px-4 py-2.5 rounded-xl shadow border border-slate-100">
                <div
                  className="text-[11px] md:text-xs"
                  style={{ color: "#6b7b99" }}
                >
                  Grand Total
                </div>
                <div
                  className="font-semibold text-sm md:text-base"
                  style={{ color: "#17408A" }}
                >
                  {rows
                    .reduce(
                      (sum, r) =>
                        sum +
                        Object.values(r.hours).reduce(
                          (s, h) => s + (parseFloat(h) || 0),
                          0
                        ),
                      0
                    )
                    .toFixed(1)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => {
                  if (isDirty) {
                    const proceed = window.confirm(
                      "You have unsaved changes. Continue?"
                    );
                    if (!proceed) return;
                  }
                  handleSaveAndReview();
                }}
                className="px-3 md:px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#4C6FFF] to-[#6C5CE7] text-white text-xs md:text-sm shadow"
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
