import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import AssignApproverPopup from "../components/AssignAprroverPopUp"
import approverEmployeeService from "../services/ManagerDashboard/AssignSecondaryApproverService"
import UserDashboardSidebar from "./UserDashboardSidebar";
const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function ApproverEmployees() {
  const approverId = localStorage.getItem("empid"); // logged-in approver
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignPopup, setAssignPopup] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );
    const role = (localStorage.getItem("role") || "employee").toLowerCase();

    const isManager =
    role === "manager" || role === "admin";


  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const handler = () =>
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await approverEmployeeService.getMyEmployees(approverId);
      setEmployees(Array.isArray(data) ? data : []);
      setSelected([]);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Selection ---------- */
  const toggleSelect = (empid) => {
    setSelected((prev) =>
      prev.includes(empid) ? prev.filter((x) => x !== empid) : [...prev, empid]
    );
  };

  const pagedEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return employees.slice(start, start + pageSize);
  }, [employees, page, pageSize]);

  const visibleIds = pagedEmployees.map((e) => e.empid);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  const totalItems = employees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72">
        <UserDashboardSidebar/>
      </aside>

      <main
        className={`flex-1 h-full overflow-y-auto px-4 md:px-10 py-6 md:py-2 transition-all ${mainMarginClass}`}
      >
        <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">
          <PageHeader
            section="Approvals"
            title="My Employees"
            description="View your employees and assign secondary approver."
          />

          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b bg-white/80">
              <h2 className="text-lg font-semibold text-slate-900">
                Employee List
              </h2>

              {isManager && (
                <button
                    disabled={selected.length === 0}
                    onClick={() => setAssignPopup(true)}
                    className="px-4 py-2 rounded-2xl text-white text-sm font-medium disabled:opacity-40"
                    style={{
                    background: "linear-gradient(135deg, #4C6FFF, #6C5CE7)",
                    }}
                >
                    Assign Secondary Approver
                </button>
                )}  

            </div>

            {/* Table */}
            <div className="px-6 py-4 overflow-x-auto">
              <table className="min-w-full text-xs divide-y divide-[#e5e7f5]">
                <thead className="bg-[#F3F5FF]">
                  <tr className="text-[11px] text-slate-600">
                    <th className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) =>
                          toggleSelectAll(e.target.checked)
                        }
                      />
                    </th>
                    <th className="px-3 py-2 text-left">Emp ID</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Department</th>
                    <th className="px-3 py-2 text-left">Designation</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">
                      Secondary Approver ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : pagedEmployees.length ? (
                    pagedEmployees.map((emp) => (
                      <tr
                        key={emp.empid}
                        className="hover:bg-[#F8F9FF] transition"
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(emp.empid)}
                            onChange={() => toggleSelect(emp.empid)}
                          />
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {emp.empid}
                        </td>
                        <td className="px-3 py-2">
                          {emp.fname} {emp.lname}
                        </td>
                        <td className="px-3 py-2">
                          {emp.department?.dept_name || "N/A"}
                        </td>
                        <td className="px-3 py-2">
                          {emp.designation}
                        </td>
                        <td className="px-3 py-2">
                          {emp.email}
                        </td>
                        <td className="px-3 py-2">
                          {emp.secondary_approver_id || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-slate-500"
                      >
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination
                totalItems={totalItems}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Popup */}
        {assignPopup && (
          <AssignApproverPopup
            selectedEmployeeIds={selected}
            onClose={() => setAssignPopup(false)}
            onAssigned={loadEmployees}
          />
        )}
      </main>
    </div>
  );
}
