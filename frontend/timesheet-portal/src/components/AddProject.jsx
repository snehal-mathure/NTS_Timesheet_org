// src/pages/AddProject.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiFolder, FiCalendar } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import projectService from "../services/AdminDashboard/projectService";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function AddProject() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [existingProjects, setExistingProjects] = useState([]);

  const [form, setForm] = useState({
    client_id: "",
    project_name: "",
    project_code: "",
    project_type: "",
    project_billability: "",
    start_date: "",
    end_date: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // layout: track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    projectService.getClients().then((res) => setClients(res || []));
    projectService.getProjects().then((res) => setExistingProjects(res || []));

    // listen for same-tab toggles and storage events
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!form.client_id) return "Please select a client.";
    if (!form.project_name.trim()) return "Project name cannot be empty.";
    if (!form.project_type.trim()) return "Project type cannot be empty.";
    if (!form.project_billability) return "Please select project billability.";

    const nameExists = existingProjects.some(
      (p) => p.project_name?.toLowerCase() === form.project_name.toLowerCase()
    );
    if (nameExists) return "Project name already exists.";

    if (!form.project_code.trim()) return "Project code cannot be empty.";

    const codeExists = existingProjects.some(
      (p) =>
        p.project_code &&
        p.project_code.toLowerCase() === form.project_code.toLowerCase()
    );
    if (codeExists) return "Project code already exists.";

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      return "End date cannot be earlier than start date.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await projectService.addProject(form);
      setSuccess("Project added successfully!");
      setTimeout(() => navigate("/projectlist"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Error adding project");
    }
  };

  // main margin classes mirror sidebar widths: collapsed -> md:ml-20 (icons only); expanded -> md:ml-72
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR (independent scroll) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* MAIN content shifts to avoid overlap with fixed sidebar */}
      <main
        className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6 md:py-2`}
        style={{ minHeight: "100vh" }}
      >
        <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
          {/* Header with shared PageHeader component */}
          <PageHeader
            section="Projects"
            title="Create New Project"
            description="Link the project with a client and define its billability."
          />

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm mb-4 bg-rose-50 text-rose-800 border border-rose-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl px-4 py-3 text-sm mb-4 bg-emerald-50 text-emerald-800 border border-emerald-100">
              {success}
            </div>
          )}

          {/* Card with form */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_14px_35px_rgba(15,23,42,0.08)] p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client + Project Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Select Client <span className="text-rose-600">*</span>
                  </label>
                  <select
                    name="client_id"
                    onChange={handleChange}
                    value={form.client_id}
                    className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((client) => (
                      <option key={client.clientID} value={client.clientID}>
                        {client.client_name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Choose the client this project belongs to.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Project Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="project_name"
                    onChange={handleChange}
                    value={form.project_name}
                    placeholder="e.g. Website Revamp"
                    className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Use a clear, descriptive name for the project.
                  </p>
                </div>
              </div>

              {/* Project Code + Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Project Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="project_code"
                    onChange={handleChange}
                    value={form.project_code}
                    placeholder="e.g. PRJ-001"
                    className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Unique project identifier (no duplicates).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Project Type <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="project_type"
                    onChange={handleChange}
                    value={form.project_type}
                    placeholder="e.g. Development, Maintenance"
                    className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Categorize your project (Dev, Support, Migration, etc.).
                  </p>
                </div>
              </div>

              {/* Billability + Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Project Billability <span className="text-rose-600">*</span>
                  </label>
                  <select
                    name="project_billability"
                    onChange={handleChange}
                    value={form.project_billability}
                    className="block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                  >
                    <option value="">-- Select Billability --</option>
                    <option value="Billable">Billable</option>
                    <option value="Non-Billable">Non-Billable</option>
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">
                    This controls utilization and billing calculations.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Start Date <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="date"
                      name="start_date"
                      onChange={handleChange}
                      value={form.start_date}
                      className="block w-full rounded-2xl border border-slate-200 pl-8 pr-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    End Date (Optional)
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="date"
                      name="end_date"
                      onChange={handleChange}
                      value={form.end_date}
                      className="block w-full rounded-2xl border border-slate-200 pl-8 pr-3 py-2 text-sm bg-slate-50/60 focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Leave empty for ongoing projects.
                  </p>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/projectlist")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <FiFolder className="text-[13px]" />
                  View All Projects
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-[#4C6FFF] hover:bg-[#3f59e0] text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-sm"
                >
                  <FiPlus className="text-[13px]" />
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
