import React, { useEffect, useState } from "react";
import approverService from "../services/ManagerDashboard/AssignSecondaryApproverService";

export default function AssignApproverPopup({ selectedEmployeeIds, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedApprover, setSelectedApprover] = useState(null);
  const deptId = localStorage.getItem("dept_id");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const list = await approverService.getEmployeesByDept(deptId);
    setEmployees(list);
    setFiltered(list);
  }

  function handleSearch(value) {
    setSearch(value);
    setFiltered(
      employees.filter(e =>
        `${e.fname} ${e.lname}`.toLowerCase().includes(value.toLowerCase())
      )
    );
  }

  async function handleAssign() {
    if (!selectedApprover) return alert("Please select approver");

    await approverService.assignSecondaryApprover({
  secondary_approver_id: String(selectedApprover),
  employee_ids: selectedEmployeeIds.map(String),
});


    onAssigned();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">

      {/* Blur Background */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative bg-white w-[420px] rounded-2xl p-6 shadow-xl z-[1000]">

        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Assign Secondary Approver
        </h2>

        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search employee..."
          className="w-full border rounded-xl px-3 py-2 mb-4"
        />

        <div className="max-h-64 overflow-y-auto border rounded-xl p-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">No employees found</p>
          )}

          {filtered.map(emp => (
            <div
              key={emp.empid}
              onClick={() => setSelectedApprover(emp.empid)}
              className={`p-2 rounded-lg cursor-pointer mb-1 border 
                ${selectedApprover === emp.empid ? "bg-[#4C6FFF] text-white" : "bg-slate-100"}
              `}
            >
              {emp.fname} {emp.lname}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200"
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            className="px-4 py-2 rounded-xl text-white"
            style={{
              background: "linear-gradient(135deg, #4C6FFF, #6C5CE7)"
            }}
          >
            Assign
          </button>
        </div>

      </div>
    </div>
  );
}
