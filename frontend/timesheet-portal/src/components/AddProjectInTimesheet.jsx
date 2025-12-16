import React, { useEffect, useMemo, useState } from "react";
import UserDashboardSidebar from "./UserDashboardSidebar";
import chargeCodeService from "../services/UserDashboard/chargeCodeService";
import { FiSearch, FiCheckCircle, FiX } from "react-icons/fi";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

/* ---------------- Common Button Style ---------------- */
const actionBtnClass =
  "px-4 h-9 text-xs rounded-full border border-slate-300 bg-white hover:bg-slate-100 transition";

/* ---------------- Toast Component ---------------- */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-white border-l-4 shadow-lg rounded-xl p-4 max-w-sm flex gap-3
        ${type === "success" ? "border-green-500" : "border-rose-500"}`}
    >
      {type === "success" ? (
        <FiCheckCircle className="text-green-500 mt-1" />
      ) : (
        <FiX className="text-rose-500 mt-1" />
      )}

      <div className="flex-1">
        <p className="text-sm font-semibold">
          {type === "success" ? "Success" : "Error"}
        </p>
        <p className="text-xs text-slate-600">{message}</p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

export default function AddProjectInTimesheet() {
  const [clients, setClients] = useState([]);
  const [clientProjects, setClientProjects] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [assignedProjectsSet, setAssignedProjectsSet] = useState(new Set());
  const [projectQuery, setProjectQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  /* ---------------- Load Data ---------------- */
  const loadData = async () => {
    try {
      const res = await chargeCodeService.getChargeCodeData();
      setClients(res?.clients || []);
      setClientProjects(res?.client_projects || {});
      setAssignedProjectsSet(new Set(res?.assigned_projects || []));
      setSelectedClient(null);
      setSelectedProjects(new Set());
    } catch {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- Sidebar Sync ---------------- */
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

  /* ---------------- Client Select ---------------- */
  const handleClientSelect = (clientID) => {
    setSelectedClient(clientID);
    setProjectQuery("");

    const list = clientProjects[clientID] || [];
    const ids = new Set(list.map((p) => p.id));
    const preChecked = new Set();

    assignedProjectsSet.forEach((id) => {
      if (ids.has(id)) preChecked.add(id);
    });

    setSelectedProjects(preChecked);
  };

  /* ---------------- Project Helpers ---------------- */
  const toggleProject = (id) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllForClient = () => {
    const list = clientProjects[selectedClient] || [];
    setSelectedProjects(new Set(list.map((p) => p.id)));
  };

  const clearSelectionForClient = () => setSelectedProjects(new Set());

  const filteredProjects = useMemo(() => {
    if (!selectedClient) return [];
    const list = clientProjects[selectedClient] || [];
    const q = projectQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    );
  }, [selectedClient, clientProjects, projectQuery]);

  /* ---------------- Update ---------------- */
  const handleUpdate = async () => {
    setSaving(true);
    try {
      const list = clientProjects[selectedClient] || [];
      const idsForClient = new Set(list.map((p) => p.id));

      const nextAssigned = new Set(assignedProjectsSet);
      idsForClient.forEach((id) => nextAssigned.delete(id));
      selectedProjects.forEach((id) => nextAssigned.add(id));

      await chargeCodeService.updateProjects({
        project_ids: [...nextAssigned],
      });

      setAssignedProjectsSet(nextAssigned);
      setSuccess("Projects updated successfully");
    } catch {
      setError("Failed to update projects");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Toast Auto Hide ---------------- */
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen flex bg-[#F5F7FF]">
      <UserDashboardSidebar />

      <main className={`flex-1 px-6 md:px-10 py-8 ${mainMarginClass}`}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#4C6FFF] to-[#8B5CF6] rounded-3xl p-6 text-white shadow">
            <h2 className="text-xl font-semibold">Assign Projects in Timesheet</h2>
            <p className="text-sm opacity-90">
              Select a client and assign projects
            </p>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

              {/* CLIENTS */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Clients</h3>
                  <button onClick={loadData} className={actionBtnClass}>
                    Reset
                  </button>
                </div>

                {clients.map((c) => (
                  <div
                    key={c.clientID}
                    onClick={() => handleClientSelect(c.clientID)}
                    className={`cursor-pointer px-4 py-3 rounded-xl mb-2 text-sm font-medium transition
                      ${
                        selectedClient === c.clientID
                          ? "bg-gradient-to-r from-[#4C6FFF] to-[#6C5CE7] text-white shadow"
                          : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    {c.client_name}
                  </div>
                ))}
              </div>

              {/* PROJECTS */}
              <div className="md:col-span-3 bg-white border border-slate-200 rounded-3xl p-5">
                {!selectedClient ? (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Select a client to view projects
                  </div>
                ) : (
                  <>
                    {/* Controls */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="relative w-full max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          value={projectQuery}
                          onChange={(e) => setProjectQuery(e.target.value)}
                          placeholder="Search projects or codes"
                          className="pl-10 pr-3 h-9 text-sm w-full border border-slate-300 rounded-full"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={selectAllForClient} className={actionBtnClass}>
                          Select all
                        </button>
                        <button onClick={clearSelectionForClient} className={actionBtnClass}>
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Project List */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-[50vh] overflow-y-auto grid md:grid-cols-2 gap-3">
                      {filteredProjects.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 hover:shadow-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProjects.has(p.id)}
                            onChange={() => toggleProject(p.id)}
                            className="mt-1"
                          />
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.code}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Update Button */}
                    <div className="flex justify-end mt-5">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className={`px-6 h-10 text-sm rounded-full font-medium
                          ${
                            saving
                              ? "bg-slate-300 text-slate-600"
                              : "bg-[#4C6FFF] hover:bg-[#3f59e0] text-white"
                          }`}
                      >
                        {saving ? "Saving..." : "Update Projects"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TOAST CONTAINER */}
        <div className="fixed top-5 right-5 z-50 space-y-3">
          {success && (
            <Toast
              type="success"
              message={success}
              onClose={() => setSuccess("")}
            />
          )}
          {error && (
            <Toast
              type="error"
              message={error}
              onClose={() => setError("")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
