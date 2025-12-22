// src/pages/ApproveTimesheets.jsx
import React, { useEffect, useState, useRef } from "react";
import UserDashboardSidebar from "../components/UserDashboardSidebar";
import PageHeader from "../components/PageHeader";
import approveService from "../services/AdminDashboard/approveTimesheetsService";

const SIDEBAR_KEY = "td_sidebar_collapsed";
const accent = "#4C6FFF";

export default function ApproveTimesheets() {
  const [timesheets, setTimesheets] = useState([]);
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState({ open: false, type: "", id: null, comments: "" });
  const [bulkModal, setBulkModal] = useState({ open: false, type: "", comments: "" });

  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(SIDEBAR_KEY) === "true");
  const successRef = useRef(null);
  const [assignPopup, setAssignPopup] = useState(false);








  // Pagination state (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
const deptId = localStorage.getItem("dept_id");

  useEffect(() => {
    loadTimesheets();
    // listen to sidebar change events
    const onCustom = () => setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    const onStorage = (e) => {
      if (e?.key === SIDEBAR_KEY) setSidebarCollapsed(e.newValue === "true");
    };
    window.addEventListener("td_sidebar_change", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("td_sidebar_change", onCustom);
      window.removeEventListener("storage", onStorage);
      if (successRef.current) clearTimeout(successRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTimesheets() {
    setLoading(true);
    const data = await approveService.getTimesheets();
    setTimesheets(Array.isArray(data) ? data : (data || []));
    setLoading(false);
    // reset to first page when data reloads
    setPage(1);
  }

  function toggleSelect(id) {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function openModal(id, type) {
    setModal({ open: true, id, type, comments: "" });
  }

  async function handleSingleAction() {
    try {
      await approveService.singleAction(modal.id, modal.type, modal.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setModal({ open: false, id: null, type: "", comments: "" });
      await loadTimesheets();
    }
  }

  async function handleBulkAction() {
    try {
      await approveService.bulkAction(selected, bulkModal.type, bulkModal.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkModal({ open: false, type: "", comments: "" });
      setSelected([]);
      await loadTimesheets();
    }
  }

  // ---- Pagination helpers ----
  const totalItems = timesheets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is valid if pageSize or totalItems changed
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, totalItems, totalPages]);

  const pagedTimesheets = timesheets.slice((page - 1) * pageSize, page * pageSize);

  // For header checkbox: check if all visible rows are selected
  const visibleIds = pagedTimesheets.map((t) => t.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleSelectAllVisible = (checked) => {
    if (checked) {
      // add all visible IDs (avoid duplicates)
      setSelected((prev) => {
        const setPrev = new Set(prev);
        visibleIds.forEach((id) => setPrev.add(id));
        return Array.from(setPrev);
      });
    } else {
      // remove visible IDs
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  // Page number rendering (simple, shows up to 7 buttons centered around current)
  const getPageNumbers = () => {
    const maxButtons = 7;
    const pages = [];
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // compute main margin responsive to sidebarCollapsed
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-64";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      <UserDashboardSidebar />

      <main className={`flex-1 px-4 md:px-10 py-6 md:py-4 transition-all duration-200 ${mainMarginClass}`}>
        <div className="max-w-6xl mx-auto mt-4 md:mt-6 space-y-5">
          <PageHeader
            section="Approvals"
            title="Timesheet Approvals"
            description="Review and approve or reject submitted timesheets."
          />

          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-[#4C6FFF]" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2v4M6 6h12M5 10h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Timesheet Approvals</h2>
                  <p className="text-sm text-slate-500">Approve or reject submitted timesheets.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/approvalhistory"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Approval History
                </a>
              </div>
            </div>

            {/* Table / Controls */}
            <div className="px-6 py-5">
              {/* Bulk buttons */}
              {timesheets.length > 0 && (
                <div className="flex items-center gap-4 mb-4">
                  <button
                    disabled={selected.length === 0}
                    onClick={() => setBulkModal({ open: true, type: "approve", comments: "" })}
                    className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 disabled:opacity-40"
                  >
                    Approve Selected
                  </button>

                  <button
                    disabled={selected.length === 0}
                    onClick={() => setBulkModal({ open: true, type: "reject", comments: "" })}
                    className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 disabled:opacity-40"
                  >
                    Reject Selected
                  </button>
                  


                  <div className="text-sm text-slate-600">{selected.length} selected</div>

                  {/* spacer */}
                  <div className="ml-auto flex items-center gap-3">
                    <div className="text-sm text-slate-600">
                      Showing {(totalItems === 0) ? 0 : ( (page - 1) * pageSize + 1 )} - {Math.min(page * pageSize, totalItems)} of {totalItems}
                    </div>

                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="rounded-2xl border border-[#e1e4f3] bg-white px-3 py-1 text-sm"
                    >
                      {[5,10,20,50].map((s) => (
                        <option key={s} value={s}>{s} / page</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
                  <thead className="bg-[#F3F5FF]">
                    <tr className="text-slate-600">
                      <th className="py-3 px-4 text-left font-medium">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                        />
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Employee</th>
                      <th className="py-3 px-4 text-left font-medium">Week</th>
                      <th className="py-3 px-4 text-left font-medium">Submitted</th>
                      <th className="py-3 px-4 text-left font-medium">Total Hours</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-500">Loading...</td>
                      </tr>
                    ) : pagedTimesheets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-500">No timesheets found.</td>
                      </tr>
                    ) : (
                      pagedTimesheets.map(ts => (
                        <React.Fragment key={ts.id}>
                          <tr className="hover:bg-[#F8F9FF] transition" onClick={() => toggleExpand(ts.id)}>
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selected.includes(ts.id)}
                                onClick={e => e.stopPropagation()}
                                onChange={() => toggleSelect(ts.id)}
                              />
                            </td>

                            <td className="py-3 px-4 font-medium text-slate-800">{ts.employee_name}</td>
                            <td className="py-3 px-4 text-slate-700">{ts.week_start_date}</td>
                            <td className="py-3 px-4 text-slate-600">{ts.submitted_date || "—"}</td>
                            <td className="py-3 px-4 text-slate-700">{Number(ts.total_hours).toFixed(2)}</td>

                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                  ts.status === "Approved"
                                    ? "bg-emerald-600 text-white"
                                    : ts.status === "Submitted"
                                    ? "bg-blue-50 text-blue-600 border border-blue-300 hover:bg-blue-100"
                                    : "bg-rose-500 text-white"
                                }`}
                              >
                                {ts.status}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={e => { e.stopPropagation(); openModal(ts.id, "approve"); }}
                                  className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 
                                            border border-emerald-100 flex items-center justify-center
                                            hover:bg-emerald-100 transition"
                                  title="Approve"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>

                                <button
                                  onClick={e => { e.stopPropagation(); openModal(ts.id, "reject"); }}
                                  className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 
                                            border border-rose-100 flex items-center justify-center
                                            hover:bg-rose-100 transition"
                                  title="Reject"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* expanded details */}
                          {expanded[ts.id] && (
                            <tr>
                              <td colSpan="7" className="p-4 bg-white">
                                <TimesheetDetails id={ts.id} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>Confirm
                </table>
              </div>

              {/* Pagination controls */}
              {totalItems > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 rounded-2xl bg-white border border-slate-200"
                    >
                      Prev
                    </button>

                    {getPageNumbers().map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`px-3 py-1 rounded-2xl border ${
                          pNum === page ? "bg-[#4C6FFF] text-white border-[#4C6FFF]" : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 rounded-2xl bg-white border border-slate-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#e5e7f5] bg-[#F3F5FF]">
              <p className="text-[11px] md:text-xs text-slate-500">Tip: Click a row to view timesheet details. Use bulk actions to approve or reject multiple timesheets.</p>
            </div>
          </div>

          {/* Single Action Modal */}
          {modal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
              <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-3">
                  {modal.type === "approve" ? "Approve Timesheet" : "Reject Timesheet"}
                </h3>

                <textarea
                  value={modal.comments}
                  onChange={e => setModal({ ...modal, comments: e.target.value })}
                  placeholder={modal.type === "reject" ? "Reason for rejection (optional)" : "Optional comments"}
                  className="w-full border rounded p-2 mb-4 text-sm"
                  rows={4}
                />

                <div className="flex justify-end gap-3">
                  <button onClick={() => setModal({ open: false, id: null, type: "", comments: "" })} className="px-4 py-2 rounded-2xl bg-slate-100">Cancel</button>
                  <button onClick={handleSingleAction} className="px-4 py-2 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}>Confirm</button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Modal */}
          {bulkModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
              <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-3">Bulk {bulkModal.type === "approve" ? "Approve" : "Reject"}</h3>

                <textarea
                  value={bulkModal.comments}
                  onChange={e => setBulkModal({ ...bulkModal, comments: e.target.value })}
                  placeholder={bulkModal.type === "reject" ? "Reason for rejection (optional)" : "Optional comments"}
                  className="w-full border rounded p-2 mb-4 text-sm"
                  rows={4}
                />

                <div className="flex justify-end gap-3">
                  <button onClick={() => setBulkModal({ open: false, type: "", comments: "" })} className="px-4 py-2 rounded-2xl bg-slate-100">Cancel</button>
                  <button onClick={handleBulkAction} className="px-4 py-2 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}>Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Assign Secondary Approver Popup */}


      </main>
    </div>
  );
}

function TimesheetDetails({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    approveService.fetchTimesheetDetails(id)
      .then((json) => {
        if (json.success) setData(json);
        else setData({ error: json.error });
      })
      .catch(() => setData({ error: "Unable to load details" }));
  }, [id]);

  if (!data) return <div className="p-4 text-sm">Loading...</div>;
  if (data.error) return <div className="p-4 text-red-600">{data.error}</div>;

  const dayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const {
    employee_name,
    hours_by_project,
    day_labels,
    total_hours,
    week_total
  } = data;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl border border-slate-200">

      <h2 className="text-xl font-semibold mb-4 text-slate-800">
        {employee_name}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rounded-xl overflow-hidden border border-blue-200 bg-white">

          {/* HEADER */}
          <thead className="bg-blue-100 text-slate-800">
            <tr>
              <th className="px-4 py-4 text-left font-semibold border-r border-blue-200 w-40">
                Client
              </th>

              <th className="px-4 py-4 text-left font-semibold border-r border-blue-200 w-40">
                Project
              </th>

              {dayOrder.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-center font-semibold border-r border-blue-200"
                >
                  <div>{day_labels[key].label}</div>
                  <div className="text-[11px] text-slate-600">
                    {day_labels[key].date}
                  </div>
                </th>
              ))}

              <th className="px-4 py-4 text-center font-semibold">
                Total
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {Object.entries(hours_by_project).map(([code, proj], idx) => (
              <tr
                key={code}
                className={idx % 2 === 0 ? "bg-white" : "bg-white"}
              >
                <td className="px-4 py-3 font-medium text-slate-800 border-r border-blue-100">
                  {proj.client_name}
                </td>

                <td className="px-4 py-3 text-slate-700 border-r border-blue-100">
                  {proj.project_name}
                </td>

                {dayOrder.map((key) => (
                  <td
                    key={key}
                    className="px-4 py-3 text-center text-slate-700 border-r border-blue-100"
                  >
                    {proj.hours[key] || 0}
                  </td>
                ))}

                <td className="px-4 py-3 text-center font-semibold text-slate-800">
                  {proj.total}
                </td>
              </tr>
            ))}

            {/* DAILY TOTAL */}
            <tr className="bg-slate-100 font-semibold text-slate-800">
              <td className="px-4 py-4 border-r border-slate-300" colSpan={2}>
                Daily Total
              </td>

              {dayOrder.map((key) => (
                <td
                  key={key}
                  className="px-4 py-4 text-center border-r border-slate-300"
                >
                  {total_hours[key] || 0}
                </td>
              ))}

              <td className="px-4 py-4 text-center">
                {week_total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-slate-700 font-semibold text-sm">
        Total Hours (Week): {week_total}
      </div>
    </div>
  );
}



