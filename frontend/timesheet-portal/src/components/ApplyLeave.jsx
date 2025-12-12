// src/pages/ApplyLeave.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import applyLeaveService from "../services/UserDashboard/applyLeaveService";
import UserDashboardSidebar from "../components/UserDashboardSidebar";

const SIDEBAR_KEY = "td_sidebar_collapsed";

export default function ApplyLeave() {
  const [loading, setLoading] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState([]); // [{ leave_id, leave_type: {leave_type}, balance }]
  const [publicHolidays, setPublicHolidays] = useState([]); // ['2025-12-25', ...]
  const [restrictedHolidays, setRestrictedHolidays] = useState([]); // [{start_date, description}]
  const [disableSubmit, setDisableSubmit] = useState(false);

  // form state
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [leaveTypeText, setLeaveTypeText] = useState("");
  const [selectedRHDate, setSelectedRHDate] = useState(""); // for Restricted Holiday
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveEntries, setLeaveEntries] = useState([]); // [{ date:'YYYY-MM-DD', is_half:false, half_type:null, duration:'Full Day', readonly:false }]
  const [workingDaysCount, setWorkingDaysCount] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const listRef = useRef(null);
  const rhItemRefs = useRef({}); // to store refs for RH items

  // sidebar collapsed state (for clean layout spacing)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  // listen for sidebar toggle events so layout updates immediately
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

  // load form data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await applyLeaveService.getFormData();
        // expected keys: leave_balance, public_holidays, restricted_holidays, disable_submit
        if (!mounted) return;
        setLeaveBalances(res.leave_balance || []);
        setPublicHolidays((res.public_holidays || []).map((h) => h.start_date));
        setRestrictedHolidays(res.restricted_holidays || []);
        setDisableSubmit(Boolean(res.disable_submit));
      } catch (err) {
        setError("Failed to load form data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // helper: check if date string is public holiday
  const isPublicHoliday = (dateStr) => publicHolidays.includes(dateStr);

  // when leaveType changes -> update leaveTypeText, and RH preset if applicable
  useEffect(() => {
    const selected = leaveBalances.find(
      (lb) => String(lb.leave_id) === String(leaveTypeId)
    );
    const text = selected ? selected.leave_type?.leave_type || "" : "";
    setLeaveTypeText(text);
    setError("");
    setSuccess("");

    if (text === "Restricted Holiday") {
      // preset first RH if available
      if (restrictedHolidays.length > 0) {
        const rhDate = restrictedHolidays[0].start_date;
        setSelectedRHDate(rhDate);
        setStartDate(rhDate);
        setEndDate(rhDate);
        // create a single readonly entry representing the RH (server expects one entry)
        setLeaveEntries([
          { date: rhDate, is_half: false, half_type: null, duration: "Full Day", readonly: false },
        ]);
        setWorkingDaysCount(1);
      } else {
        setSelectedRHDate("");
        setStartDate("");
        setEndDate("");
        setLeaveEntries([]);
        setWorkingDaysCount(0);
      }
    } else {
      // clear RH selection and regenerate entries for current dates
      setSelectedRHDate("");
      // build entries from start/end (if present)
      buildLeaveEntries(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveTypeId, leaveBalances, restrictedHolidays]);

  // build leaveEntries for date range for normal leaves
  const buildLeaveEntries = (from, to) => {
    setError("");
    setLeaveEntries([]);
    setWorkingDaysCount(0);

    if (!from || !to) return;

    const fromDate = new Date(from + "T00:00:00");
    const toDate = new Date(to + "T00:00:00");
    if (toDate < fromDate) {
      setError("End date cannot be before start date.");
      return;
    }

    const arr = [];
    let working = 0;
    const current = new Date(fromDate);

    while (current <= toDate) {
      const iso = current.toLocaleDateString("en-CA"); // YYYY-MM-DD without timezone shift
      const day = current.getDay();

      if (day >= 1 && day <= 5 && !isPublicHoliday(iso)) {
        // working day
        arr.push({
          date: iso,
          is_half: false,
          half_type: null,
          duration: "Full Day",
          readonly: false,
        });
        working += 1;
      } else {
        // weekend or public holiday — show readonly label
        arr.push({
          date: iso,
          is_half: false,
          half_type: null,
          duration: isPublicHoliday(iso) ? "Public Holiday" : "Weekend",
          readonly: true,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    setLeaveEntries(arr);
    setWorkingDaysCount(working);
  };

  // rebuild entries when dates change and not Restricted Holiday
  useEffect(() => {
    if (leaveTypeText !== "Restricted Holiday") {
      buildLeaveEntries(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, publicHolidays, leaveTypeText]);

  // recompute working days whenever leaveEntries changes (reliable - no timeouts)
  useEffect(() => {
    let working = 0;
    leaveEntries.forEach((e) => {
      if (e.readonly) return;
      if (e.duration === "Full Day") working += 1;
      else if (e.duration === "Half Day") working += 0.5;
    });
    setWorkingDaysCount(working);
  }, [leaveEntries]);

  // handle duration change for a specific date (ignore if readonly)
  const handleDurationChange = (date, value) => {
    setLeaveEntries((prev) =>
      prev.map((e) => {
        if (e.date !== date) return e;
        if (e.readonly) return e; // guard
        const updated = { ...e };
        updated.duration = value;
        if (value === "Full Day") {
          updated.is_half = false;
          updated.half_type = null;
        } else if (value === "Half Day") {
          updated.is_half = true;
          if (!updated.half_type) updated.half_type = "First Half";
        }
        return updated;
      })
    );
  };

  const handleHalfTypeChange = (date, halfType) => {
    setLeaveEntries((prev) =>
      prev.map((e) => {
        if (e.date !== date) return e;
        if (e.readonly) return e;
        return { ...e, half_type: halfType };
      })
    );
  };

  // auto-scroll RH list to selected item
  useEffect(() => {
    if (!selectedRHDate || !listRef.current) return;
    const el = rhItemRefs.current[selectedRHDate];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedRHDate]);

  // helper to get selected leave balance amount
  const getSelectedLeaveBalance = () => {
    const lb = leaveBalances.find((x) => String(x.leave_id) === String(leaveTypeId));
    return lb ? Number(lb.balance) : null;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!leaveTypeId) {
      setError("Please select leave type.");
      return;
    }

    const balance = getSelectedLeaveBalance();

    if (leaveTypeText === "Restricted Holiday") {
      if (!selectedRHDate) {
        setError("Please select a restricted holiday.");
        return;
      }
      // For RH, workingDaysCount should be 1
      if (balance !== null && 1 > balance) {
        setError("Insufficient leave balance for this restricted holiday.");
        return;
      }
    } else {
      // normal leave validations
      if (!startDate || !endDate) {
        setError("Please select start and end dates.");
        return;
      }
      if (new Date(endDate + "T00:00:00") < new Date(startDate + "T00:00:00")) {
        setError("End date cannot be before start date.");
        return;
      }
      if (workingDaysCount <= 0) {
        setError("No valid working days selected.");
        return;
      }
      if (balance !== null && workingDaysCount > balance) {
        setError(`Insufficient leave balance. You are applying for ${workingDaysCount} days but have ${balance} left.`);
        return;
      }
    }

    // Build payload
    let payload = {
      leave_type_id: Number(leaveTypeId),
      start_date: startDate,
      end_date: endDate,
      reason,
      applied_on: new Date().toISOString().slice(0, 10),
    };

    if (leaveTypeText === "Restricted Holiday") {
      payload.holiday_date = selectedRHDate;
      payload.leave_entries = [
        { date: selectedRHDate, is_half: false, half_type: null },
      ];
    } else {
      // map leaveEntries to server schema but only include working-day entries (Full Day or Half Day)
      const entries = leaveEntries
        .filter((e) => !e.readonly && (e.duration === "Full Day" || e.duration === "Half Day"))
        .map((e) => ({
          date: e.date,
          is_half: e.duration === "Half Day",
          half_type: e.half_type || null,
        }));
      payload.leave_entries = entries;
    }

    try {
      setLoading(true);
      const res = await applyLeaveService.submitLeave(payload);
      if (res && res.status === "success") {
        setSuccess(res.message || "Leave request submitted successfully!");
        // redirect after a short delay so user sees success
        setTimeout(() => navigate("/emp_leave_dashboard"), 1200);
      } else {
        setError(res.message || "Failed to submit leave.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const accent = "#4C6FFF";

  // --- SMALL (subtle) OVERLAP SETTINGS ---
  // w-72 sidebar ~= 18rem; we set margin slightly smaller so main overlaps a bit.
  const expandedLeft = "16rem"; // ~2rem overlap when sidebar expanded
  const collapsedLeft = "5rem";  // ~1rem overlap when sidebar collapsed
  const mainMarginLeft = sidebarCollapsed ? collapsedLeft : expandedLeft;

  return (
    <div className="min-h-screen flex bg-[#F5F7FF]">
      {/* Fixed Sidebar */}
      <UserDashboardSidebar />

      {/* MAIN CONTENT - slightly overlaps sidebar for a subtle effect */}
      <main
        className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 transition-all duration-300"
        style={{ marginLeft: mainMarginLeft }}
      >
        <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">
          {/* Reusable page header */}
          <PageHeader
            section="Leaves"
            title="Apply for Leave"
            description="Request a leave — choose type, dates and duration per day."
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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M8 9h8M8 13h5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900">
                    Apply for Leave
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Select leave type, choose date range and specify per-day durations.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                {disableSubmit ? "Leave submissions currently disabled" : "Ready to apply"}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 md:py-7">
              {error && (
                <div
                  role="status"
                  className="rounded-xl px-4 py-3 text-sm mb-5 bg-rose-50 text-rose-800 border border-rose-100"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  role="status"
                  className="rounded-xl px-4 py-3 text-sm mb-5 bg-emerald-50 text-emerald-800 border border-emerald-100"
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-2 grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Leave Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(e.target.value)}
                    className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                    required
                  >
                    <option value="">-- Select Leave Type --</option>
                    {leaveBalances.map((lb) => (
                      <option
                        key={lb.leave_id}
                        value={String(lb.leave_id)}
                        data-leave-type={lb.leave_type?.leave_type || ""}
                      >
                        {lb.leave_type?.leave_type} (Balance: {lb.balance})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Restricted Holiday block */}
                {leaveTypeText === "Restricted Holiday" && (
                  <div className="p-3 bg-[#FBFBFF] rounded-xl border border-[#eef2ff]">
                    <label className="block text-sm font-semibold mb-2">Applicable Restricted Holidays</label>
                    {restrictedHolidays.length === 0 && (
                      <div className="text-sm text-slate-500">No upcoming restricted holidays.</div>
                    )}
                    <div ref={listRef} className="space-y-2 max-h-36 overflow-auto">
                      {restrictedHolidays.map((rh, idx) => (
                        <div
                          ref={(el) => (rhItemRefs.current[rh.start_date] = el)}
                          className="flex items-center mb-2"
                          key={rh.start_date + String(idx)}
                        >
                          <input
                            type="radio"
                            id={`rh_${idx}`}
                            name="holiday_date"
                            checked={selectedRHDate === rh.start_date}
                            onChange={() => {
                              setSelectedRHDate(rh.start_date);
                              setStartDate(rh.start_date);
                              setEndDate(rh.start_date);
                              setLeaveEntries([{ date: rh.start_date, is_half: false, half_type: null, duration: "Full Day", readonly: false }]);
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`rh_${idx}`} className="flex-1 text-sm">
                            {rh.description} ({rh.start_date})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                      required
                      readOnly={leaveTypeText === "Restricted Holiday"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                      required
                      readOnly={leaveTypeText === "Restricted Holiday"}
                    />
                  </div>
                </div>

                {/* Leave Durations per day */}
                <div className={`${leaveTypeText === "Restricted Holiday" ? "hidden" : ""}`}>
                  <label className="block text-sm font-semibold mb-2">Leave Duration Per Day</label>
                  <div className="space-y-2 border rounded p-3 max-h-52 overflow-auto">
                    {leaveEntries.length ? (
                      leaveEntries.map((entry) => (
                        <div key={entry.date} className="flex items-center gap-3">
                          <div className="w-36 font-medium text-sm">{entry.date}</div>

                          {entry.readonly ? (
                            <div className="text-sm text-slate-500">{entry.duration}</div>
                          ) : (
                            <>
                              <select
                                value={entry.duration}
                                onChange={(e) => handleDurationChange(entry.date, e.target.value)}
                                className="border rounded p-1 text-sm"
                              >
                                <option value="Full Day">Full Day</option>
                                <option value="Half Day">Half Day</option>
                              </select>

                              <select
                                value={entry.half_type || "First Half"}
                                onChange={(e) => handleHalfTypeChange(entry.date, e.target.value)}
                                className={`border rounded p-1 text-sm ${entry.duration === "Half Day" ? "" : "hidden"}`}
                              >
                                <option value="First Half">First Half</option>
                                <option value="Second Half">Second Half</option>
                              </select>

                              <div className="ml-auto text-sm font-medium">
                                {isPublicHoliday(entry.date) ? <span className="text-yellow-700">Public Holiday</span> : null}
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">Select start and end date to see per-day options.</div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="block w-full rounded-2xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                    required
                  />
                </div>

                {/* Working days display */}
                <div className="text-sm font-semibold text-slate-800">
                  Working Days: <span className="text-[#0b4970]">{workingDaysCount}</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4">
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-[0_14px_40px_rgba(76,111,255,0.55)]"
                      style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
                      disabled={disableSubmit || loading}
                    >
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/emp_leave_dashboard")}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-700 border border-[#e0e4ff] bg-white hover:bg-[#f3f5ff]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="text-xs text-slate-500">{disableSubmit ? "Submissions are disabled" : ""}</div>
                </div>
              </form>
            </div>

            {/* Card footer */}
            <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
              <p className="text-[11px] md:text-xs text-slate-500">
                Tip: Public holidays & weekends will be shown in the duration list but cannot be selected as working days.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


// src/pages/ApplyLeave.jsx
// src/pages/ApplyLeave.jsx
// src/pages/ApplyLeave.jsx
// import React, { useEffect, useState, useRef } from "react";
// import applyLeaveService from "../services/UserDashboard/applyLeaveService";
// import { useNavigate, Link } from "react-router-dom";
// import PageHeader from "../components/PageHeader";

// export default function ApplyLeave() {
//   const [loading, setLoading] = useState(true);
//   const [leaveBalances, setLeaveBalances] = useState([]); // [{ leave_id, leave_type: {leave_type}, balance }]
//   const [publicHolidays, setPublicHolidays] = useState([]); // ['2025-12-25', ...]
//   const [restrictedHolidays, setRestrictedHolidays] = useState([]); // [{start_date, description}]
//   const [disableSubmit, setDisableSubmit] = useState(false);

//   // form state
//   const [leaveTypeId, setLeaveTypeId] = useState("");
//   const [leaveTypeText, setLeaveTypeText] = useState("");
//   const [selectedRHDate, setSelectedRHDate] = useState(""); // for Restricted Holiday
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [reason, setReason] = useState("");
//   const [leaveEntries, setLeaveEntries] = useState([]); // [{ date:'YYYY-MM-DD', is_half:false, half_type:null, duration:'Full Day' }]
//   const [workingDaysCount, setWorkingDaysCount] = useState(0);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const navigate = useNavigate();
//   const listRef = useRef(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await applyLeaveService.getFormData();
//         // expected keys: leave_balance, public_holidays, restricted_holidays, disable_submit
//         setLeaveBalances(res.leave_balance || []);
//         setPublicHolidays((res.public_holidays || []).map((h) => h.start_date));
//         setRestrictedHolidays(res.restricted_holidays || []);
//         setDisableSubmit(Boolean(res.disable_submit));
//       } catch (err) {
//         setError("Failed to load form data.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   // helper: check if date string is public holiday
//   const isPublicHoliday = (dateStr) => publicHolidays.includes(dateStr);

//   // when leaveType changes
//   useEffect(() => {
//     const selected = leaveBalances.find(
//       (lb) => String(lb.leave_id) === String(leaveTypeId)
//     );
//     const text = selected ? selected.leave_type?.leave_type || "" : "";
//     setLeaveTypeText(text);

//     // Restricted holiday: preset selectedRHDate if there's first RH
//     if (text === "Restricted Holiday") {
//       if (restrictedHolidays.length > 0) {
//         setSelectedRHDate(restrictedHolidays[0].start_date);
//         setStartDate(restrictedHolidays[0].start_date);
//         setEndDate(restrictedHolidays[0].start_date);
//       } else {
//         setSelectedRHDate("");
//         setStartDate("");
//         setEndDate("");
//       }
//       setLeaveEntries([]);
//       setWorkingDaysCount(1); // RH always 1
//       setError("");
//     } else {
//       setSelectedRHDate("");
//       // regenerate entries if dates present
//       buildLeaveEntries(startDate, endDate, text);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [leaveTypeId, leaveBalances]);

//   // build leaveEntries for date range for normal leaves
//   const buildLeaveEntries = (from, to, _leaveTypeText = leaveTypeText) => {
//     setError("");
//     setLeaveEntries([]);
//     setWorkingDaysCount(0);

//     if (!from || !to) return;

//     const fromDate = new Date(from);
//     const toDate = new Date(to);
//     if (toDate < fromDate) {
//       setError("End date cannot be before start date.");
//       return;
//     }

//     let arr = [];
//     let current = new Date(fromDate);
//     let working = 0;

//     while (current <= toDate) {
//       const iso = current.toISOString().slice(0, 10);
//       const day = current.getDay();

//       if (day >= 1 && day <= 5 && !isPublicHoliday(iso)) {
//         // working day
//         arr.push({
//           date: iso,
//           is_half: false,
//           half_type: null,
//           duration: "Full Day",
//         });
//         working += 1;
//       } else {
//         // either weekend or public holiday — still show label but not selectable
//         arr.push({
//           date: iso,
//           is_half: false,
//           half_type: null,
//           duration: isPublicHoliday(iso) ? "Public Holiday" : "Weekend",
//           readonly: true,
//         });
//       }
//       current.setDate(current.getDate() + 1);
//     }

//     setLeaveEntries(arr);
//     setWorkingDaysCount(working);
//   };

//   useEffect(() => {
//     // rebuild entries when dates change and not RH
//     if (leaveTypeText !== "Restricted Holiday") {
//       buildLeaveEntries(startDate, endDate, leaveTypeText);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [startDate, endDate, publicHolidays, leaveTypeText]);

//   // handle duration change for a specific date
//   const handleDurationChange = (date, value) => {
//     setLeaveEntries((prev) => {
//       return prev.map((e) => {
//         if (e.date !== date) return e;
//         const updated = { ...e };
//         updated.duration = value;
//         if (value === "Full Day") {
//           updated.is_half = false;
//           updated.half_type = null;
//         } else if (value === "Half Day") {
//           updated.is_half = true;
//           // default to first half if none
//           if (!updated.half_type) updated.half_type = "First Half";
//         }
//         return updated;
//       });
//     });
//     // update working days count
//     setTimeout(recomputeWorkingDays, 0);
//   };

//   const handleHalfTypeChange = (date, halfType) => {
//     setLeaveEntries((prev) =>
//       prev.map((e) => (e.date === date ? { ...e, half_type: halfType } : e))
//     );
//     setTimeout(recomputeWorkingDays, 0);
//   };

//   const recomputeWorkingDays = () => {
//     let working = 0;
//     leaveEntries.forEach((e) => {
//       if (e.duration === "Full Day") working += 1;
//       else if (e.duration === "Half Day") working += 0.5;
//     });
//     setWorkingDaysCount(working);
//   };

//   // Form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!leaveTypeId) {
//       setError("Please select leave type.");
//       return;
//     }

//     if (leaveTypeText === "Restricted Holiday") {
//       if (!selectedRHDate) {
//         setError("Please select a restricted holiday.");
//         return;
//       }
//     } else {
//       // normal leave validations
//       if (!startDate || !endDate) {
//         setError("Please select start and end dates.");
//         return;
//       }
//       if (new Date(endDate) < new Date(startDate)) {
//         setError("End date cannot be before start date.");
//         return;
//       }
//       if (workingDaysCount <= 0) {
//         setError("No valid working days selected.");
//         return;
//       }
//     }

//     // Build payload
//     let payload = {
//       leave_type_id: Number(leaveTypeId),
//       start_date: startDate,
//       end_date: endDate,
//       reason,
//       applied_on: new Date().toISOString().slice(0, 10),
//     };

//     if (leaveTypeText === "Restricted Holiday") {
//       payload.holiday_date = selectedRHDate;
//       payload.leave_entries = [
//         { date: selectedRHDate, is_half: false, half_type: null },
//       ];
//     } else {
//       // map leaveEntries to server schema but only include working-day entries (Full Day or Half Day)
//       const entries = leaveEntries
//         .filter((e) => e.duration === "Full Day" || e.duration === "Half Day")
//         .map((e) => ({
//           date: e.date,
//           is_half: e.duration === "Half Day",
//           half_type: e.half_type,
//         }));
//       payload.leave_entries = entries;
//     }

//     try {
//       setLoading(true);
//       const res = await applyLeaveService.submitLeave(payload);
//       if (res && res.status === "success") {
//         setSuccess(res.message || "Leave request submitted successfully!");
//         // optionally redirect after short delay
//         setTimeout(() => navigate("/emp_leave_dashboard"), 1200);
//       } else {
//         setError(res.message || "Failed to submit leave.");
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || err.message || "Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div className="h-screen flex items-center justify-center">Loading...</div>;
//   }

//   // Accent color used in AddClient UI
//   const accent = "#4C6FFF";

//   // Page: keep top space so header and accent remain visible and create a gap above the card
//   return (
//     <div
//       className="min-h-screen w-full overflow-x-hidden overflow-y-auto"
//       style={{ backgroundColor: "#F5F7FF" }}
//     >
//       <main className="w-full max-w-3xl px-4 md:px-8 py-6 mx-auto">
//         {/* Top spacing so header & accent do not touch the top of the page */}
//         <div className="mt-16 md:mt-20 space-y-4">
//           {/* Page header */}
//           <PageHeader
//             section="Leaves"
//             title="Apply for Leave"
//             description="Request a leave — choose type, dates and duration per day."
//           />

//           {/* Card wrapper: contains a top accent bar and the card itself.
//               Accent bar is rounded to match card's top corners. */}
//           <div className="overflow-hidden rounded-2xl">
//             {/* --- TOP ACCENT BAR --- */}
//             <div
//               className="h-1 w-full"
//               style={{
//                 background: `linear-gradient(90deg, ${accent}, #6C5CE7)`,
//               }}
//               aria-hidden
//             />

//             {/* Card */}
//             <div className="bg-white/90 border border-[#e5e7f5] rounded-b-2xl shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden">
//               {/* Card header with same icon + back link */}
//               <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7f5] bg-white/80">
//                 <div className="flex items-center gap-3">
//                   <Link
//                     to="/empleavedashboard"
//                     className="inline-flex items-center gap-2 rounded-full px-2 py-1 hover:bg-[#f3f5ff] text-sm text-slate-700"
//                     aria-label="Back to dashboard"
//                   >
//                     {/* simple left arrow icon */}
//                     <svg
//                       width="14"
//                       height="14"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       className="text-slate-700"
//                       aria-hidden
//                     >
//                       <path
//                         d="M15 18l-6-6 6-6"
//                         stroke="currentColor"
//                         strokeWidth="1.6"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     <span className="hidden sm:inline text-sm">Back</span>
//                   </Link>

//                   <div className="w-10 h-10 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                     {/* rectangle icon similar to AddClient */}
//                     <svg
//                       className="w-5 h-5 text-[#4C6FFF]"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       aria-hidden
//                     >
//                       <rect
//                         x="3"
//                         y="4"
//                         width="18"
//                         height="16"
//                         rx="3"
//                         stroke="currentColor"
//                         strokeWidth="1.6"
//                       />
//                       <path
//                         d="M8 9h8M8 13h5"
//                         stroke="currentColor"
//                         strokeWidth="1.6"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </div>

//                   <div>
//                     <h2 className="text-sm md:text-base font-semibold text-slate-900">Apply for Leave</h2>
//                     <p className="text-xs text-slate-500">Select leave type, choose date range and specify per-day durations.</p>
//                   </div>
//                 </div>

//                 <div className="text-xs text-slate-500">{disableSubmit ? "Leave submissions currently disabled" : "Ready to apply"}</div>
//               </div>

//               {/* Body (scrolls if content overflows) */}
//               <div className="px-5 py-4 md:py-5 max-h-[78vh] overflow-auto">
//                 {error && (
//                   <div role="status" className="rounded-xl px-3 py-2 text-sm mb-4 bg-rose-50 text-rose-800 border border-rose-100">
//                     {error}
//                   </div>
//                 )}
//                 {success && (
//                   <div role="status" className="rounded-xl px-3 py-2 text-sm mb-4 bg-emerald-50 text-emerald-800 border border-emerald-100">
//                     {success}
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="mt-1 grid grid-cols-1 gap-4">
//                   {/* Leave Type */}
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-600 mb-1">Leave Type <span className="text-rose-500">*</span></label>
//                     <select
//                       value={leaveTypeId}
//                       onChange={(e) => setLeaveTypeId(e.target.value)}
//                       className="block w-full rounded-xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.18)] focus:border-[#4C6FFF]"
//                       required
//                     >
//                       <option value="">-- Select Leave Type --</option>
//                       {leaveBalances.map((lb) => (
//                         <option
//                           key={lb.leave_id}
//                           value={String(lb.leave_id)}
//                           data-leave-type={lb.leave_type?.leave_type || ""}
//                         >
//                           {lb.leave_type?.leave_type} (Balance: {lb.balance})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Restricted Holiday block */}
//                   {leaveTypeText === "Restricted Holiday" && (
//                     <div className="p-3 bg-[#FBFBFF] rounded-xl border border-[#eef2ff]">
//                       <label className="block text-sm font-semibold mb-2">Applicable Restricted Holidays</label>
//                       {restrictedHolidays.length === 0 && (
//                         <div className="text-sm text-slate-500">No upcoming restricted holidays.</div>
//                       )}
//                       <div ref={listRef} className="space-y-2 max-h-36 overflow-auto">
//                         {restrictedHolidays.map((rh, idx) => (
//                           <div className="flex items-center mb-2" key={rh.start_date + String(idx)}>
//                             <input
//                               type="radio"
//                               id={`rh_${idx}`}
//                               name="holiday_date"
//                               checked={selectedRHDate === rh.start_date}
//                               onChange={() => {
//                                 setSelectedRHDate(rh.start_date);
//                                 setStartDate(rh.start_date);
//                                 setEndDate(rh.start_date);
//                               }}
//                               className="mr-2"
//                             />
//                             <label htmlFor={`rh_${idx}`} className="flex-1 text-sm">
//                               {rh.description} ({rh.start_date})
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Dates */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
//                       <input
//                         type="date"
//                         value={startDate}
//                         onChange={(e) => setStartDate(e.target.value)}
//                         className="block w-full rounded-xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.18)] focus:border-[#4C6FFF]"
//                         required
//                         readOnly={leaveTypeText === "Restricted Holiday"}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
//                       <input
//                         type="date"
//                         value={endDate}
//                         onChange={(e) => setEndDate(e.target.value)}
//                         className="block w-full rounded-xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.18)] focus:border-[#4C6FFF]"
//                         required
//                         readOnly={leaveTypeText === "Restricted Holiday"}
//                       />
//                     </div>
//                   </div>

//                   {/* Leave Durations per day */}
//                   <div className={`${leaveTypeText === "Restricted Holiday" ? "hidden" : ""}`}>
//                     <label className="block text-sm font-semibold mb-2">Leave Duration Per Day</label>
//                     <div className="space-y-2 border rounded p-3 max-h-52 overflow-auto">
//                       {leaveEntries.length ? (
//                         leaveEntries.map((entry) => (
//                           <div key={entry.date} className="flex items-center gap-3">
//                             <div className="w-36 font-medium text-sm">{entry.date}</div>

//                             {entry.readonly ? (
//                               <div className="text-sm text-slate-500">{entry.duration}</div>
//                             ) : (
//                               <>
//                                 <select
//                                   value={entry.duration}
//                                   onChange={(e) => handleDurationChange(entry.date, e.target.value)}
//                                   className="border rounded p-1 text-sm"
//                                 >
//                                   <option value="Full Day">Full Day</option>
//                                   <option value="Half Day">Half Day</option>
//                                 </select>

//                                 <select
//                                   value={entry.half_type || "First Half"}
//                                   onChange={(e) => handleHalfTypeChange(entry.date, e.target.value)}
//                                   className={`border rounded p-1 text-sm ${entry.duration === "Half Day" ? "" : "hidden"}`}
//                                 >
//                                   <option value="First Half">First Half</option>
//                                   <option value="Second Half">Second Half</option>
//                                 </select>

//                                 <div className="ml-auto text-sm font-medium">
//                                   {isPublicHoliday(entry.date) ? <span className="text-yellow-700">Public Holiday</span> : null}
//                                 </div>
//                               </>
//                             )}
//                           </div>
//                         ))
//                       ) : (
//                         <div className="text-sm text-slate-500">Select start and end date to see per-day options.</div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Reason */}
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-600 mb-1">Reason</label>
//                     <textarea
//                       value={reason}
//                       onChange={(e) => setReason(e.target.value)}
//                       rows={4}
//                       className="block w-full rounded-xl border border-[#e1e4f3] bg-[#F8F9FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(76,111,255,0.18)] focus:border-[#4C6FFF]"
//                       required
//                     />
//                   </div>

//                   {/* Working days display */}
//                   <div className="text-sm font-semibold text-slate-800">
//                     Working Days: <span className="text-[#0b4970]">{workingDaysCount}</span>
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex flex-col md:flex-row items-center gap-3 mt-1">
//                     <button
//                       type="submit"
//                       className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-[0_10px_30px_rgba(76,111,255,0.35)]"
//                       style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
//                       disabled={disableSubmit || loading}
//                     >
//                       {loading ? "Submitting..." : "Submit Application"}
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => navigate("/emp_leave_dashboard")}
//                       className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 border border-[#e0e4ff] bg-white hover:bg-[#f3f5ff]"
//                     >
//                       Cancel
//                     </button>

//                     <div className="ml-auto text-xs text-slate-500">
//                       {disableSubmit ? "Submissions are disabled" : ""}
//                     </div>
//                   </div>
//                 </form>
//               </div>

//               {/* Card footer */}
//               <div className="px-5 py-3 border-t border-[#e5e7f5] bg-[#F3F5FF]">
//                 <p className="text-[11px] text-slate-500">
//                   Tip: Public holidays & weekends will be shown in the duration list but cannot be selected as working days.
//                 </p>
//               </div>
//             </div>
//           </div>
//           {/* end card wrapper */}
//         </div>
//       </main>
//     </div>
//   );
// }
