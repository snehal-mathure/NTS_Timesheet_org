
// // src/components/ProjectList.jsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   FiPlus,
//   FiFilter,
//   FiX,
//   FiFolder,
//   FiTrash2,
//   FiEdit3,
// } from "react-icons/fi";
// import projectService from "../services/AdminDashboard/projectService";
// import Sidebar from "./Sidebar";
// import PageHeader from "./PageHeader";

// export default function ProjectList() {
//   const [projects, setProjects] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [filters, setFilters] = useState({
//     client: "",
//     billability: "",
//     project_type: "",
//   });

//   const [editModal, setEditModal] = useState(false);
//   const [deleteModal, setDeleteModal] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // ✅ success message after edit
//   const [successMessage, setSuccessMessage] = useState("");

//   // 🔹 Edit form state
//   const [editForm, setEditForm] = useState({
//     client_id: "",
//     project_name: "",
//     project_code: "",
//     project_billability: "",
//     project_type: "",
//     start_date: "",
//     end_date: "",
//   });

//   const accent = "#4C6FFF";

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters]);

//   const loadData = async () => {
//     try {
//       setLoading(true);

//       // 🔹 Map UI filters -> API filters
//       const apiFilters = {
//         client_id: filters.client || undefined,
//         project_billability: filters.billability || undefined,
//         project_type: filters.project_type || undefined,
//       };

//       const projectData = await projectService.getProjects(apiFilters);
//       const clientData = await projectService.getClients();

//       setProjects(Array.isArray(projectData) ? projectData : []);
//       setClients(Array.isArray(clientData) ? clientData : []);
//     } catch (err) {
//       console.error("Failed to load projects/clients", err);
//       setProjects([]);
//       setClients([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEdit = (project) => {
//     setSelectedProject(project);

//     // 🔹 Prefill form from selected project
//     setEditForm({
//       client_id:
//         project.client_id ??
//         project.clientID ??
//         project.clientId ??
//         "",

//       project_name: project.project_name || "",
//       project_code: project.project_code || "",
//       project_billability: project.project_billability || "",
//       project_type: project.project_type || "",
//       start_date: project.start_date ? project.start_date.slice(0, 10) : "",
//       end_date: project.end_date ? project.end_date.slice(0, 10) : "",
//     });

//     setEditModal(true);
//   };

//   const openDelete = (project) => {
//     setSelectedProject(project);
//     setDeleteModal(true);
//   };

//   const handleDelete = async () => {
//     if (!selectedProject) return;
//     try {
//       await projectService.deleteProject(selectedProject.id);
//       setDeleteModal(false);
//       setSelectedProject(null);
//       await loadData();
//     } catch (err) {
//       console.error("Delete failed", err);
//       alert("Failed to delete project");
//     }
//   };

//   // 🔹 Save changes from Edit modal + show success message
//   const handleEditSubmit = async () => {
//     if (!selectedProject) return;
//     try {
//       await projectService.updateProject(selectedProject.id, editForm);
//       setEditModal(false);
//       setSelectedProject(null);
//       await loadData();

//       // ✅ show success text
//       setSuccessMessage("Project updated successfully.");

//       // optional: auto-hide after few seconds
//       setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000);
//     } catch (err) {
//       console.error("Update failed", err);
//       alert("Failed to update project");
//     }
//   };

//   const resetFilters = () => {
//     setFilters({
//       client: "",
//       billability: "",
//       project_type: "",
//     });
//   };

//   const uniqueTypes = Array.from(
//     new Set(projects.map((p) => p.project_type).filter(Boolean))
//   );

//   return (
//     <div
//       className="min-h-screen flex"
//       style={{ backgroundColor: "#F5F7FF" }}
//     >
//       {/* Sidebar (same style as other pages) */}
//       <Sidebar />

//       {/* MAIN */}
//       <main className="flex-1 px-4 md:px-10 py-6 md:py-2">
//         <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
//           {/* ✅ Success banner (non-intrusive) */}
//           {successMessage && (
//             <div className="flex items-center justify-between px-4 py-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800">
//               <span>{successMessage}</span>
//               <button
//                 onClick={() => setSuccessMessage("")}
//                 className="w-5 h-5 flex items-center justify-center rounded-full border border-emerald-200 hover:bg-emerald-100"
//               >
//                 <FiX className="w-3 h-3" />
//               </button>
//             </div>
//           )}

//           {/* Page header like View Clients */}
//           <PageHeader
//             section="Projects"
//             title="Project Portfolio"
//             description="View, filter, and manage all active and historical projects."
//           />

//           {/* Main card (header + filters + table) */}
//           <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
//             {/* Card header bar (like View Clients header) */}
//             <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                   <FiFolder className="w-6 h-6 text-[#4C6FFF]" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-slate-900">
//                     Project List
//                   </h2>
//                   <p className="text-sm text-slate-500">
//                     View, filter, and manage projects.
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 to="/addproject"
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-white text-sm shadow-[0_14px_40px_rgba(76,111,255,0.55)]"
//                 style={{
//                   background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
//                 }}
//               >
//                 <FiPlus className="w-4 h-4" />
//                 Add Project
//               </Link>
//             </div>

//             {/* Filters area (inside same card like search in View Clients) */}
//             <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <div className="w-7 h-7 rounded-xl bg-slate-900/5 flex items-center justify-center">
//                     <FiFilter className="text-slate-700" size={14} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-semibold text-slate-700">
//                       Filter Projects
//                     </p>
//                     <p className="text-[11px] text-slate-400">
//                       Narrow down by client, billability or project type.
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={resetFilters}
//                   className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
//                 >
//                   <FiFilter className="text-[13px]" />
//                   Reset Filters
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
//                 {/* Client filter */}
//                 <div>
//                   <label className="text-[11px] font-medium text-slate-600 mb-1 block">
//                     Client
//                   </label>
//                   <select
//                     className="border border-slate-200 rounded-2xl w-full px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                     value={filters.client}
//                     onChange={(e) =>
//                       setFilters((prev) => ({
//                         ...prev,
//                         client: e.target.value,
//                       }))
//                     }
//                   >
//                     <option value="">All Clients</option>
//                     {clients.map((c) => (
//                       <option
//                         key={c.clientID ?? c.id ?? c.client_id}
//                         value={c.clientID ?? c.id ?? c.client_id}
//                       >
//                         {c.client_name ?? c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Billability filter */}
//                 <div>
//                   <label className="text-[11px] font-medium text-slate-600 mb-1 block">
//                     Billability
//                   </label>
//                   <select
//                     className="border border-slate-200 rounded-2xl w-full px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                     value={filters.billability}
//                     onChange={(e) =>
//                       setFilters((prev) => ({
//                         ...prev,
//                         billability: e.target.value,
//                       }))
//                     }
//                   >
//                     <option value="">All Billability</option>
//                     <option value="Billable">Billable</option>
//                     <option value="Non-Billable">Non-Billable</option>
//                   </select>
//                 </div>

//                 {/* Project type filter */}
//                 <div>
//                   <label className="text-[11px] font-medium text-slate-600 mb-1 block">
//                     Project Type
//                   </label>
//                   <select
//                     className="border border-slate-200 rounded-2xl w-full px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                     value={filters.project_type}
//                     onChange={(e) =>
//                       setFilters((prev) => ({
//                         ...prev,
//                         project_type: e.target.value,
//                       }))
//                     }
//                   >
//                     <option value="">All Types</option>
//                     {uniqueTypes.map((type, index) => (
//                       <option key={index} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Table area with same design as View Clients */}
//             <div className="px-6 pb-6 pt-3">
//               <p className="text-[11px] text-slate-400 mb-2">
//                 {projects.length} record(s) found
//               </p>

//               {loading ? (
//                 <div className="text-slate-500 py-6 text-center">
//                   Loading projects...
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
//                     <thead className="bg-[#F3F5FF]">
//                       <tr className="text-slate-600">
//                         <th className="py-3 px-4 text-left font-medium">
//                           Client
//                         </th>
//                         <th className="py-3 px-4 text-left font-medium">
//                           Project
//                         </th>
//                         <th className="py-3 px-4 text-left font-medium">
//                           Code
//                         </th>
//                         <th className="py-3 px-4 text-left font-medium">
//                           Start Date
//                         </th>
//                         <th className="py-3 px-4 text-left font-medium">
//                           End Date
//                         </th>
//                         <th className="py-3 px-4 text-left font-medium">
//                           Billability
//                         </th>
//                         <th className="py-3 px-4 text-left font-medium">
//                           Type
//                         </th>
//                         <th className="py-3 px-4 text-center font-medium">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {projects.length === 0 ? (
//                         <tr>
//                           <td
//                             colSpan={8}
//                             className="py-6 text-center text-sm text-slate-500"
//                           >
//                             No projects found.
//                           </td>
//                         </tr>
//                       ) : (
//                         projects.map((p) => (
//                           <React.Fragment key={p.id}>
//                             <tr className="hover:bg-[#F8F9FF] transition">
//                               <td className="py-3 px-4 text-slate-800">
//                                 {p.client_name}
//                               </td>
//                               <td className="py-3 px-4 text-slate-800">
//                                 {p.project_name}
//                               </td>
//                               <td className="py-3 px-4 text-slate-700">
//                                 {p.project_code}
//                               </td>
//                               <td className="py-3 px-4 text-slate-700">
//                                 {p.start_date?.slice(0, 10)}
//                               </td>
//                               <td className="py-3 px-4 text-slate-700">
//                                 {p.end_date ? p.end_date.slice(0, 10) : "Ongoing"}
//                               </td>
//                               <td className="py-3 px-4">
//                                 <span
//                                   className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
//                                     p.project_billability === "Billable"
//                                       ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
//                                       : "bg-amber-50 text-amber-700 border border-amber-100"
//                                   }`}
//                                 >
//                                   {p.project_billability}
//                                 </span>
//                               </td>
//                               <td className="py-3 px-4 text-slate-700">
//                                 {p.project_type}
//                               </td>
//                               <td className="py-3 px-4">
//                                 <div className="flex justify-center gap-2">
//                                   <button
//                                     className="p-2 rounded-xl bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 transition"
//                                     onClick={() => openEdit(p)}
//                                     title="Edit Project"
//                                   >
//                                     <FiEdit3 size={15} />
//                                   </button>
//                                   <button
//                                     className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition"
//                                     onClick={() => openDelete(p)}
//                                     title="Delete Project"
//                                   >
//                                     <FiTrash2 size={15} />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           </React.Fragment>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Delete Modal */}
//           {deleteModal && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center">
//               <div
//                 className="absolute inset-0 bg-black/40"
//                 onClick={() => setDeleteModal(false)}
//               />
//               <div className="relative bg-white rounded-3xl shadow-[0_18px_40px_rgba(15,23,42,0.35)] w-[90%] max-w-sm p-5 border border-slate-100">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 rounded-2xl bg-rose-50 flex items-center justify-center">
//                       <FiTrash2 className="text-rose-500" size={15} />
//                     </div>
//                     <h2 className="text-sm font-semibold text-slate-900">
//                       Delete Project
//                     </h2>
//                   </div>
//                   <button
//                     onClick={() => setDeleteModal(false)}
//                     className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
//                   >
//                     <FiX size={14} />
//                   </button>
//                 </div>

//                 <p className="text-xs text-slate-600 mb-5 leading-relaxed">
//                   Are you sure you want to permanently delete{" "}
//                   <span className="font-semibold">
//                     {selectedProject?.project_name ?? "this project"}
//                   </span>
//                   ? This action cannot be undone.
//                 </p>

//                 <div className="flex justify-end gap-2">
//                   <button
//                     className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
//                     onClick={() => setDeleteModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="px-3.5 py-1.5 rounded-2xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
//                     onClick={handleDelete}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Edit Modal */}
//           {editModal && (
//             <div className="fixed inset-0 z-40 flex items-center justify-center">
//               <div
//                 className="absolute inset-0 bg-black/40"
//                 onClick={() => setEditModal(false)}
//               />
//               <div className="relative bg-white rounded-3xl shadow-xl w-[90%] max-w-md p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <h2 className="text-sm font-semibold text-slate-900">
//                     Edit Project
//                   </h2>
//                   <button
//                     onClick={() => setEditModal(false)}
//                     className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
//                   >
//                     <FiX size={14} />
//                   </button>
//                 </div>

//                 {/* FORM CONTENT */}
//                 <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
//                   {/* Client */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       Client
//                     </label>
//                     <select
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.client_id}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           client_id: e.target.value,
//                         }))
//                       }
//                     >
//                       <option value="">Select Client</option>
//                       {clients.map((c) => (
//                         <option
//                           key={c.clientID ?? c.id ?? c.client_id}
//                           value={c.clientID ?? c.id ?? c.client_id}
//                         >
//                           {c.client_name ?? c.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Project Name */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       Project Name
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.project_name}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           project_name: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   {/* Project Code */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       Project Code
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.project_code}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           project_code: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   {/* Billability */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       Project Billability
//                     </label>
//                     <select
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.project_billability}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           project_billability: e.target.value,
//                         }))
//                       }
//                     >
//                       <option value="Billable">Billable</option>
//                       <option value="Non-Billable">Non-Billable</option>
//                     </select>
//                   </div>

//                   {/* Project Type */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       Project Type
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.project_type}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           project_type: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   {/* Start Date */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.start_date}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           start_date: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   {/* End Date */}
//                   <div>
//                     <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                       End Date
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       value={editForm.end_date}
//                       onChange={(e) =>
//                         setEditForm((prev) => ({
//                           ...prev,
//                           end_date: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2 mt-5">
//                   <button
//                     className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
//                     onClick={() => setEditModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
//                     onClick={handleEditSubmit}
//                   >
//                     Save Changes
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// src/components/ProjectList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiFilter,
  FiX,
  FiFolder,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";
import projectService from "../services/AdminDashboard/projectService";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    client: "",
    billability: "",
    project_type: "",
  });

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ success message after edit
  const [successMessage, setSuccessMessage] = useState("");

  // 🔹 Edit form state
  const [editForm, setEditForm] = useState({
    client_id: "",
    project_name: "",
    project_code: "",
    project_billability: "",
    project_type: "",
    start_date: "",
    end_date: "",
  });

  const accent = "#4C6FFF";

  // sidebar collapsed state (to adjust layout)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    // listen for same-tab and cross-tab changes
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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 🔹 Map UI filters -> API filters
      const apiFilters = {
        client_id: filters.client || undefined,
        project_billability: filters.billability || undefined,
        project_type: filters.project_type || undefined,
      };

      const projectData = await projectService.getProjects(apiFilters);
      const clientData = await projectService.getClients();

      setProjects(Array.isArray(projectData) ? projectData : []);
      setClients(Array.isArray(clientData) ? clientData : []);
    } catch (err) {
      console.error("Failed to load projects/clients", err);
      setProjects([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (project) => {
    setSelectedProject(project);

    // 🔹 Prefill form from selected project
    setEditForm({
      client_id:
        project.client_id ?? project.clientID ?? project.clientId ?? "",
      project_name: project.project_name || "",
      project_code: project.project_code || "",
      project_billability: project.project_billability || "",
      project_type: project.project_type || "",
      start_date: project.start_date ? project.start_date.slice(0, 10) : "",
      end_date: project.end_date ? project.end_date.slice(0, 10) : "",
    });

    setEditModal(true);
  };

  const openDelete = (project) => {
    setSelectedProject(project);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await projectService.deleteProject(selectedProject.id);
      setDeleteModal(false);
      setSelectedProject(null);
      await loadData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete project");
    }
  };

  // 🔹 Save changes from Edit modal + show success message
  const handleEditSubmit = async () => {
    if (!selectedProject) return;
    try {
      await projectService.updateProject(selectedProject.id, editForm);
      setEditModal(false);
      setSelectedProject(null);
      await loadData();

      // ✅ show success text
      setSuccessMessage("Project updated successfully.");

      // optional: auto-hide after few seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update project");
    }
  };

  const resetFilters = () => {
    setFilters({
      client: "",
      billability: "",
      project_type: "",
    });
  };

  const uniqueTypes = Array.from(
    new Set(projects.map((p) => p.project_type).filter(Boolean))
  );

  // main margin classes mirror sidebar widths: collapsed -> md:ml-20 (icons only); expanded -> md:ml-72
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR (desktop) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 md:w-72 lg:w-72">
        <Sidebar />
      </aside>

      {/* MAIN: shift to avoid overlap with fixed sidebar */}
      <main className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6 md:py-2`}>
        <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
          {/* ✅ Success banner (non-intrusive) */}
          {successMessage && (
            <div className="flex items-center justify-between px-4 py-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="w-5 h-5 flex items-center justify-center rounded-full border border-emerald-200 hover:bg-emerald-100"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Page header like View Clients */}
          <PageHeader
            section="Projects"
            title="Project Portfolio"
            description="View, filter, and manage all active and historical projects."
          />

          {/* Main card (header + filters + table) */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
            {/* Card header bar (like View Clients header) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <FiFolder className="w-6 h-6 text-[#4C6FFF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Project List
                  </h2>
                  <p className="text-sm text-slate-500">
                    View, filter, and manage projects.
                  </p>
                </div>
              </div>

              <Link
                to="/addproject"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-white text-sm shadow-[0_14px_40px_rgba(76,111,255,0.55)]"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
                }}
              >
                <FiPlus className="w-4 h-4" />
                Add Project
              </Link>
            </div>

            {/* Filters area (inside same card like search in View Clients) */}
            <div className="px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900/5 flex items-center justify-center">
                    <FiFilter className="text-slate-700" size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Filter Projects
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Narrow down by client, billability or project type.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <FiFilter className="text-[13px]" />
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Client filter */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Client
                  </label>
                  <select
                    className="border border-slate-200 rounded-2xl w-full px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                    value={filters.client}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        client: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Clients</option>
                    {clients.map((c) => (
                      <option
                        key={c.clientID ?? c.id ?? c.client_id}
                        value={c.clientID ?? c.id ?? c.client_id}
                      >
                        {c.client_name ?? c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billability filter */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Billability
                  </label>
                  <select
                    className="border border-slate-200 rounded-2xl w-full px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                    value={filters.billability}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        billability: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Billability</option>
                    <option value="Billable">Billable</option>
                    <option value="Non-Billable">Non-Billable</option>
                  </select>
                </div>

                {/* Project type filter */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">
                    Project Type
                  </label>
                  <select
                    className="border border-slate-200 rounded-2xl w-full px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                    value={filters.project_type}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        project_type: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table area with same design as View Clients */}
            <div className="px-6 pb-6 pt-3">
              <p className="text-[11px] text-slate-400 mb-2">
                {projects.length} record(s) found
              </p>

              {loading ? (
                <div className="text-slate-500 py-6 text-center">
                  Loading projects...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
                    <thead className="bg-[#F3F5FF]">
                      <tr className="text-slate-600">
                        <th className="py-3 px-4 text-left font-medium">Client</th>
                        <th className="py-3 px-4 text-left font-medium">Project</th>
                        <th className="py-3 px-4 text-left font-medium">Code</th>
                        <th className="py-3 px-4 text-left font-medium">Start Date</th>
                        <th className="py-3 px-4 text-left font-medium">End Date</th>
                        <th className="py-3 px-4 text-left font-medium">Billability</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-sm text-slate-500">
                            No projects found.
                          </td>
                        </tr>
                      ) : (
                        projects.map((p) => (
                          <React.Fragment key={p.id}>
                            <tr className="hover:bg-[#F8F9FF] transition">
                              <td className="py-3 px-4 text-slate-800">{p.client_name}</td>
                              <td className="py-3 px-4 text-slate-800">{p.project_name}</td>
                              <td className="py-3 px-4 text-slate-700">{p.project_code}</td>
                              <td className="py-3 px-4 text-slate-700">{p.start_date?.slice(0, 10)}</td>
                              <td className="py-3 px-4 text-slate-700">
                                {p.end_date ? p.end_date.slice(0, 10) : "Ongoing"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                    p.project_billability === "Billable"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : "bg-amber-50 text-amber-700 border border-amber-100"
                                  }`}
                                >
                                  {p.project_billability}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-700">{p.project_type}</td>
                              <td className="py-3 px-4">
                                <div className="flex justify-center gap-2">
                                  <button
                                    className="p-2 rounded-xl bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 transition"
                                    onClick={() => openEdit(p)}
                                    title="Edit Project"
                                  >
                                    <FiEdit3 size={15} />
                                  </button>
                                  <button
                                    className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition"
                                    onClick={() => openDelete(p)}
                                    title="Delete Project"
                                  >
                                    <FiTrash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Delete Modal */}
          {deleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteModal(false)} />
              <div className="relative bg-white rounded-3xl shadow-[0_18px_40px_rgba(15,23,42,0.35)] w-[90%] max-w-sm p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-2xl bg-rose-50 flex items-center justify-center">
                      <FiTrash2 className="text-rose-500" size={15} />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-900">Delete Project</h2>
                  </div>
                  <button onClick={() => setDeleteModal(false)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <FiX size={14} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold">{selectedProject?.project_name ?? "this project"}</span>? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                  <button className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => setDeleteModal(false)}>
                    Cancel
                  </button>
                  <button className="px-3.5 py-1.5 rounded-2xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setEditModal(false)} />
              <div className="relative bg-white rounded-3xl shadow-xl w-[90%] max-w-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Edit Project</h2>
                  <button onClick={() => setEditModal(false)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <FiX size={14} />
                  </button>
                </div>

                {/* FORM CONTENT */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {/* Client */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Client</label>
                    <select
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.client_id}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          client_id: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Client</option>
                      {clients.map((c) => (
                        <option key={c.clientID ?? c.id ?? c.client_id} value={c.clientID ?? c.id ?? c.client_id}>
                          {c.client_name ?? c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Name */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.project_name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          project_name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Project Code */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Project Code</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.project_code}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          project_code: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Billability */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Project Billability</label>
                    <select
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.project_billability}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          project_billability: e.target.value,
                        }))
                      }
                    >
                      <option value="Billable">Billable</option>
                      <option value="Non-Billable">Non-Billable</option>
                    </select>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Project Type</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.project_type}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          project_type: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.start_date}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-[#F8F9FF] focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      value={editForm.end_date}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                  <button className="px-3.5 py-1.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => setEditModal(false)}>
                    Cancel
                  </button>
                  <button className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700" onClick={handleEditSubmit}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
