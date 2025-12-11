// // src/pages/ListEmployee.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { Link } from "react-router-dom";
// import {
//   FiSearch,
//   FiFilter,
//   FiDownload,
//   FiPlus,
//   FiArrowLeft,
//   FiUsers,
// } from "react-icons/fi";
// import Sidebar from "../components/Sidebar";
// import PageHeader from "../components/PageHeader";
// import employeeService from "../services/AdminDashboard/employeeService";

// function Field({ label, children }) {
//   return (
//     <div>
//       <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-0.5">
//         {label}
//       </div>
//       <div className="text-xs font-medium text-slate-800">{children}</div>
//     </div>
//   );
// }

// export default function ListEmployee() {
//   // data
//   const [employees, setEmployees] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [approvers, setApprovers] = useState([]);

//   // UI state / filters
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [selectedApprover, setSelectedApprover] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [showFilters, setShowFilters] = useState(false);

//   // page state
//   const [loading, setLoading] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [clientDetails, setClientDetails] = useState([]);
//   const [alert, setAlert] = useState(null);

//   // load employees with current server-side filters
//   const loadEmployees = async () => {
//     setLoading(true);
//     try {
//       const params = {
//         dept: selectedDepartment || undefined,
//         approver_id: selectedApprover || undefined,
//         start_date: startDate || undefined,
//         end_date: endDate || undefined,
//       };
//       const data = await employeeService.getEmployees(params);
//       setEmployees(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//       setAlert({ type: "error", message: "Failed to load employees." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadEmployees();

//     const loadDeptAndApprovers = async () => {
//       try {
//         const deptList = await employeeService.getDepartments();
//         setDepartments(Array.isArray(deptList) ? deptList : []);

//         const approverList = await employeeService.getAllApprovers();
//         setApprovers(Array.isArray(approverList) ? approverList : []);
//       } catch (err) {
//         console.error("Failed to load departments/approvers", err);
//       }
//     };

//     loadDeptAndApprovers();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // When department changes, fetch approvers for that dept (or all if cleared)
//   useEffect(() => {
//     const loadApprovers = async () => {
//       try {
//         if (!selectedDepartment) {
//           const all = await employeeService.getAllApprovers();
//           setApprovers(Array.isArray(all) ? all : []);
//           return;
//         }
//         const list = await employeeService.getApproversByDepartment(
//           selectedDepartment
//         );
//         setApprovers(Array.isArray(list) ? list : []);
//       } catch (err) {
//         console.error("approvers load error", err);
//         setApprovers([]);
//       }
//     };
//     loadApprovers();
//   }, [selectedDepartment]);

//   // Apply filter
//   const applyFilters = (e) => {
//     e?.preventDefault();
//     loadEmployees();
//     setShowFilters(false);
//   };

//   const resetFilters = () => {
//     setSelectedDepartment("");
//     setSelectedApprover("");
//     setStartDate("");
//     setEndDate("");
//     setStatusFilter("");
//     setSearchText("");
//     loadEmployees();
//   };

//   // client-side filter on top of server-side result
//   const filteredEmployees = useMemo(() => {
//     const txt = searchText.trim().toLowerCase();
//     return employees.filter((emp) => {
//       let match = true;
//       if (txt) {
//         const hay = `${emp.empid ?? ""} ${emp.fname ?? ""} ${emp.lname ?? ""} ${
//           emp.department?.dept_name ?? ""
//         } ${emp.email ?? ""}`.toLowerCase();
//         match = match && hay.includes(txt);
//       }
//       if (statusFilter) {
//         const isInactive = emp.lwd && new Date(emp.lwd) <= new Date();
//         if (statusFilter === "active" && isInactive) return false;
//         if (statusFilter === "inactive" && !isInactive) return false;
//       }
//       return match;
//     });
//   }, [employees, searchText, statusFilter]);

//   // view details
//   const viewEmployee = async (empid) => {
//     setLoading(true);
//     try {
//       const res = await employeeService.getEmployeeById(empid);
//       const empObj = res?.employee ?? res;
//       setSelectedEmployee(empObj || null);
//       setClientDetails(res?.client_details || []);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (err) {
//       console.error(err);
//       setAlert({ type: "error", message: "Failed to load employee details." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const backToList = () => {
//     setSelectedEmployee(null);
//     setClientDetails([]);
//   };

//   const csvUrl = employeeService.getExportCsvUrl({
//     dept: selectedDepartment,
//     approver_id: selectedApprover,
//     start_date: startDate,
//     end_date: endDate,
//   });

//   const accent = "#4C6FFF";

//   return (
//     <div
//       className="min-h-screen flex"
//       style={{ backgroundColor: "#F5F7FF" }}
//     >
//       {/* Sidebar (same pattern as other pages) */}
//       <Sidebar />

//       {/* MAIN */}
//       <main className="flex-1 px-4 md:px-10 py-6 md:py-2">
//         <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
//           {/* Page header unified with other screens */}
//           <PageHeader
//             section="Employees"
//             title="Employee Management"
//             description="View, filter and manage all employees in one place."
//           />

//           {/* Alert */}
//           {alert && (
//             <div
//               className={`rounded-2xl px-4 py-3 text-sm flex items-center justify-between ${
//                 alert.type === "error"
//                   ? "bg-rose-50 text-rose-800 border border-rose-100"
//                   : "bg-emerald-50 text-emerald-800 border border-emerald-100"
//               }`}
//             >
//               <span>{alert.message}</span>
//               <button
//                 onClick={() => setAlert(null)}
//                 className="text-xs underline decoration-dotted"
//               >
//                 Dismiss
//               </button>
//             </div>
//           )}

//           {/* DETAIL VIEW */}
//           {selectedEmployee ? (
//             <div className="bg-white/90 rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-[#e5e7f5] p-5 md:p-6 space-y-6">
//               <div className="flex items-center justify-between gap-3 border-b border-[#e5e7f5] pb-4">
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={backToList}
//                     className="inline-flex items-center justify-center w-9 h-9 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
//                   >
//                     <FiArrowLeft className="text-slate-700" size={16} />
//                   </button>
//                   <div>
//                     <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
//                       Employee Detail
//                     </p>
//                     <h2 className="text-base md:text-lg font-semibold text-slate-900">
//                       {selectedEmployee.fname} {selectedEmployee.lname}
//                     </h2>
//                     <p className="text-[11px] text-slate-500">
//                       Emp ID: {selectedEmployee.empid}
//                     </p>
//                   </div>
//                 </div>

//                 <Link
//                   to={`/admin/edit_employee/${selectedEmployee.empid}`}
//                   className="inline-flex items-center px-3 py-1.5 rounded-2xl text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-50"
//                 >
//                   Edit Details
//                 </Link>
//               </div>

//               {/* Info sections */}
//               <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
//                 <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
//                   <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
//                     Personal
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
//                     <Field label="Name">
//                       {selectedEmployee.fname} {selectedEmployee.lname}
//                     </Field>
//                     <Field label="Email">{selectedEmployee.email}</Field>
//                     <Field label="Mobile">
//                       {selectedEmployee.mobile || "N/A"}
//                     </Field>
//                     <Field label="Gender">
//                       {selectedEmployee.gender || "N/A"}
//                     </Field>
//                   </div>
//                 </section>

//                 <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
//                   <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
//                     Employment
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
//                     <Field label="Department">
//                       {selectedEmployee.department?.dept_name || "N/A"}
//                     </Field>
//                     <Field label="Designation">
//                       {selectedEmployee.designation || "N/A"}
//                     </Field>
//                     <Field label="Type">
//                       {selectedEmployee.employee_type || "N/A"}
//                     </Field>
//                     <Field label="Location">
//                       {selectedEmployee.location || "N/A"}
//                     </Field>
//                     <Field label="Prev. Experience">
//                       {(selectedEmployee.prev_total_exp ?? 0) + " yrs"}
//                     </Field>
//                     <Field label="Total Experience">
//                       {selectedEmployee.total_experience
//                         ? `${selectedEmployee.total_experience} yrs`
//                         : "N/A"}
//                     </Field>
//                   </div>
//                 </section>

//                 <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
//                   <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
//                     Dates
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
//                     <Field label="Date of Joining">
//                       {selectedEmployee.doj || "N/A"}
//                     </Field>
//                     <Field label="Last Working Day">
//                       {selectedEmployee.lwd || "Ongoing"}
//                     </Field>
//                   </div>
//                 </section>

//                 <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
//                   <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
//                     Access / Approvals
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
//                     <Field label="Approver ID">
//                       {selectedEmployee.approver_id || "N/A"}
//                     </Field>
//                     <Field label="Company">
//                       {selectedEmployee.company || "NTS"}
//                     </Field>
//                   </div>
//                 </section>
//               </div>

//               {/* Client Assignments */}
//               <section className="mt-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
//                     Client Assignments
//                   </h3>
//                 </div>
//                 {clientDetails && clientDetails.length ? (
//                   <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
//                     <table className="min-w-full text-xs">
//                       <thead className="bg-[#F3F5FF]">
//                         <tr className="text-[11px] text-slate-600">
//                           <th className="px-3 py-2 text-left font-medium">
//                             Client ID
//                           </th>
//                           <th className="px-3 py-2 text-left font-medium">
//                             Client Name
//                           </th>
//                           <th className="px-3 py-2 text-left font-medium">
//                             Start Date
//                           </th>
//                           <th className="px-3 py-2 text-left font-medium">
//                             End Date
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {clientDetails.map((d, i) => (
//                           <tr
//                             key={i}
//                             className="hover:bg-[#F8F9FF] transition border-t border-slate-100"
//                           >
//                             <td className="px-3 py-2">
//                               {d.client?.clientID}
//                             </td>
//                             <td className="px-3 py-2">
//                               {d.client?.client_name}
//                             </td>
//                             <td className="px-3 py-2">
//                               {d.assignment?.start_date}
//                             </td>
//                             <td className="px-3 py-2">
//                               {d.assignment?.end_date || "Ongoing"}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <p className="text-xs text-slate-500 mt-1">
//                     No client assignments found.
//                   </p>
//                 )}
//               </section>
//             </div>
//           ) : (
//             /* LIST VIEW */
//             <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
//               {/* Card header bar (like View Clients / Projects) */}
//               <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//                 <div className="flex items-center gap-4">
//                   <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                     <FiUsers className="w-6 h-6 text-[#4C6FFF]" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-semibold text-slate-900">
//                       Employee List
//                     </h2>
//                     <p className="text-sm text-slate-500">
//                       View, filter and manage all employees.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 md:gap-3">
//                   <a
//                     href={csvUrl}
//                     className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-medium shadow-sm hover:bg-slate-900"
//                   >
//                     <FiDownload className="text-[13px]" />
//                     Export CSV
//                   </a>
//                   <Link
//                     to="/addemployee"
//                     className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:bg-slate-50"
//                   >
//                     <FiPlus className="text-[13px]" />
//                     Add Employee
//                   </Link>
//                 </div>
//               </div>

//               {/* Top controls: search + status + filter toggle */}
//               <div className="px-6 py-4 border-b border-[#e5e7f5] bg-white/80">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                   <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
//                     <div className="relative flex-1 md:w-72">
//                       <FiSearch
//                         className="absolute left-3 top-2.5 text-slate-400"
//                         size={15}
//                       />
//                       <input
//                         type="text"
//                         value={searchText}
//                         onChange={(e) => setSearchText(e.target.value)}
//                         placeholder="Search by name, email, dept..."
//                         className="w-full pl-8 pr-3 py-2 rounded-2xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#4C6FFF] focus:border-[#4C6FFF] outline-none bg-[#F8F9FF]"
//                       />
//                     </div>
//                     <select
//                       value={statusFilter}
//                       onChange={(e) => setStatusFilter(e.target.value)}
//                       className="text-xs border border-slate-200 rounded-2xl px-3 py-2 bg-[#F8F9FF] focus:outline-none focus:ring-1 focus:ring-[#4C6FFF]"
//                     >
//                       <option value="">All Status</option>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div className="flex items-center justify-end gap-2 md:gap-3">
//                     <button
//                       type="button"
//                       onClick={() => setShowFilters((s) => !s)}
//                       className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50/70 hover:bg-slate-100"
//                     >
//                       <FiFilter className="text-[13px]" />
//                       Filters
//                     </button>
//                     <a
//                       href={csvUrl}
//                       className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50"
//                     >
//                       <FiDownload className="text-[13px]" />
//                       CSV
//                     </a>
//                     <Link
//                       to="/addemployee"
//                       className="hidden md:inline-flex items-center gap-1.5 rounded-2xl bg-[#4C6FFF] text-white px-3.5 py-1.5 text-xs font-medium shadow-sm hover:bg-[#3f59e0]"
//                     >
//                       <FiPlus className="text-[13px]" />
//                       Add Employee
//                     </Link>
//                   </div>
//                 </div>

//                 {/* Filters panel */}
//                 {showFilters && (
//                   <form
//                     onSubmit={applyFilters}
//                     className="mt-4 rounded-2xl border border-slate-100 bg-[#F8F9FF] px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-3"
//                   >
//                     <div>
//                       <label className="block text-[11px] font-medium text-slate-500 mb-1">
//                         Department
//                       </label>
//                       <select
//                         value={selectedDepartment}
//                         onChange={(e) =>
//                           setSelectedDepartment(e.target.value)
//                         }
//                         className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       >
//                         <option value="">All Departments</option>
//                         {departments.map((d) => (
//                           <option key={d.id} value={d.id}>
//                             {d.dept_name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-[11px] font-medium text-slate-500 mb-1">
//                         Approver
//                       </label>
//                       <select
//                         value={selectedApprover}
//                         onChange={(e) =>
//                           setSelectedApprover(e.target.value)
//                         }
//                         className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       >
//                         <option value="">All Approvers</option>
//                         {approvers.map((a) => (
//                           <option
//                             key={a.approver_id ?? a.id}
//                             value={a.approver_id ?? a.id}
//                           >
//                             {a.fname} {a.lname} ({a.approver_id ?? a.id})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-[11px] font-medium text-slate-500 mb-1">
//                         From
//                       </label>
//                       <input
//                         type="date"
//                         value={startDate}
//                         onChange={(e) => setStartDate(e.target.value)}
//                         className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-[11px] font-medium text-slate-500 mb-1">
//                         To
//                       </label>
//                       <input
//                         type="date"
//                         value={endDate}
//                         onChange={(e) => setEndDate(e.target.value)}
//                         className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                       />
//                     </div>

//                     <div className="md:col-span-4 flex justify-end gap-2 mt-1">
//                       <button
//                         type="button"
//                         onClick={resetFilters}
//                         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs border border-slate-200 bg-white hover:bg-slate-100"
//                       >
//                         Reset
//                       </button>
//                       <button
//                         type="submit"
//                         className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-medium bg-[#4C6FFF] text-white shadow-sm hover:bg-[#3f59e0]"
//                       >
//                         Apply
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </div>

//               {/* TABLE (styled like View Clients) */}
//               <div className="px-6 pb-6 pt-3">
//                 <p className="text-[11px] text-slate-400 mb-2">
//                   {filteredEmployees.length} record(s) found
//                 </p>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-xs divide-y divide-[#e5e7f5]">
//                     <thead className="bg-[#F3F5FF]">
//                       <tr className="text-[11px] text-slate-600">
//                         <th className="px-3 py-2 text-left font-medium">
//                           Emp ID
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Name
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Department
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Designation
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Email
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           DOJ
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           End Date
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Status
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Approver
//                         </th>
//                         <th className="px-3 py-2 text-left font-medium">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {loading ? (
//                         <tr>
//                           <td
//                             colSpan={10}
//                             className="px-3 py-6 text-center text-slate-500"
//                           >
//                             Loading employees...
//                           </td>
//                         </tr>
//                       ) : filteredEmployees.length ? (
//                         filteredEmployees.map((emp) => {
//                           const isInactive =
//                             emp.lwd && new Date(emp.lwd) <= new Date();
//                           return (
//                             <tr
//                               key={emp.empid}
//                               className="hover:bg-[#F8F9FF] transition border-b border-slate-100"
//                             >
//                               <td className="px-3 py-2 align-middle">
//                                 <span className="font-medium text-slate-800">
//                                   {emp.empid}
//                                 </span>
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.fname} {emp.lname}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.department?.dept_name || "N/A"}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.designation}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.email}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.doj || "N/A"}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.lwd || "Ongoing"}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 <span
//                                   className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
//                                     isInactive
//                                       ? "bg-rose-50 text-rose-700 border border-rose-100"
//                                       : "bg-emerald-50 text-emerald-700 border border-emerald-100"
//                                   }`}
//                                 >
//                                   <span
//                                     className={`w-1.5 h-1.5 rounded-full mr-1 ${
//                                       isInactive ? "bg-rose-500" : "bg-emerald-500"
//                                     }`}
//                                   />
//                                   {isInactive ? "Inactive" : "Active"}
//                                 </span>
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 {emp.approver_id}
//                               </td>
//                               <td className="px-3 py-2 align-middle">
//                                 <div className="flex flex-wrap gap-1.5">
//                                   <button
//                                     type="button"
//                                     onClick={() => viewEmployee(emp.empid)}
//                                     className="inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] bg-slate-900 text-white hover:bg-slate-800"
//                                   >
//                                     View
//                                   </button>
//                                   <Link
//                                     to={`/editemployee/${emp.empid}`}
//                                     className="inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-50"
//                                   >
//                                     Edit
//                                   </Link>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan={10}
//                             className="px-3 py-6 text-center text-slate-500"
//                           >
//                             No employees found for the selected filters.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }


// src/pages/ListEmployee.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiArrowLeft,
  FiUsers,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import employeeService from "../services/AdminDashboard/employeeService";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-0.5">
        {label}
      </div>
      <div className="text-xs font-medium text-slate-800">{children}</div>
    </div>
  );
}

export default function ListEmployee() {
  // data
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [approvers, setApprovers] = useState([]);

  // UI state / filters
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedApprover, setSelectedApprover] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // page state
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [clientDetails, setClientDetails] = useState([]);
  const [alert, setAlert] = useState(null);

  // layout: track sidebar collapsed so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    loadEmployees();

    const loadDeptAndApprovers = async () => {
      try {
        const deptList = await employeeService.getDepartments();
        setDepartments(Array.isArray(deptList) ? deptList : []);

        const approverList = await employeeService.getAllApprovers();
        setApprovers(Array.isArray(approverList) ? approverList : []);
      } catch (err) {
        console.error("Failed to load departments/approvers", err);
      }
    };

    loadDeptAndApprovers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // update layout if sidebar toggled elsewhere (same-tab event)
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

  // load employees with current server-side filters
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        dept: selectedDepartment || undefined,
        approver_id: selectedApprover || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };
      const data = await employeeService.getEmployees(params);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Failed to load employees." });
    } finally {
      setLoading(false);
    }
  };

  // When department changes, fetch approvers for that dept (or all if cleared)
  useEffect(() => {
    const loadApprovers = async () => {
      try {
        if (!selectedDepartment) {
          const all = await employeeService.getAllApprovers();
          setApprovers(Array.isArray(all) ? all : []);
          return;
        }
        const list = await employeeService.getApproversByDepartment(
          selectedDepartment
        );
        setApprovers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("approvers load error", err);
        setApprovers([]);
      }
    };
    loadApprovers();
  }, [selectedDepartment]);

  // Apply filter
  const applyFilters = (e) => {
    e?.preventDefault();
    loadEmployees();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSelectedDepartment("");
    setSelectedApprover("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("");
    setSearchText("");
    loadEmployees();
  };

  // client-side filter on top of server-side result
  const filteredEmployees = useMemo(() => {
    const txt = searchText.trim().toLowerCase();
    return employees.filter((emp) => {
      let match = true;
      if (txt) {
        const hay = `${emp.empid ?? ""} ${emp.fname ?? ""} ${emp.lname ?? ""} ${
          emp.department?.dept_name ?? ""
        } ${emp.email ?? ""}`.toLowerCase();
        match = match && hay.includes(txt);
      }
      if (statusFilter) {
        const isInactive = emp.lwd && new Date(emp.lwd) <= new Date();
        if (statusFilter === "active" && isInactive) return false;
        if (statusFilter === "inactive" && !isInactive) return false;
      }
      return match;
    });
  }, [employees, searchText, statusFilter]);

  // view details
  const viewEmployee = async (empid) => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployeeById(empid);
      const empObj = res?.employee ?? res;
      setSelectedEmployee(empObj || null);
      setClientDetails(res?.client_details || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Failed to load employee details." });
    } finally {
      setLoading(false);
    }
  };

  const backToList = () => {
    setSelectedEmployee(null);
    setClientDetails([]);
  };

  const csvUrl = employeeService.getExportCsvUrl({
    dept: selectedDepartment,
    approver_id: selectedApprover,
    start_date: startDate,
    end_date: endDate,
  });

  const accent = "#4C6FFF";

  // compute main margin:
  // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
  // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR (independent scroll) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 md:w-72 lg:w-72">
        <Sidebar />
      </aside>

      {/* mobile placeholder / accessibility */}
      <div className="md:hidden" />

      {/* MAIN (scrollable) */}
      <main
        className={`flex-1 h-full overflow-y-auto px-4 md:px-10 py-6 md:py-2 transition-all duration-200 ${mainMarginClass}`}
      >
        <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
          {/* Page header unified with other screens */}
          <PageHeader
            section="Employees"
            title="Employee Management"
            description="View, filter and manage all employees."
          />

          {/* Alert */}
          {alert && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm flex items-center justify-between ${
                alert.type === "error"
                  ? "bg-rose-50 text-rose-800 border border-rose-100"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-100"
              }`}
            >
              <span>{alert.message}</span>
              <button
                onClick={() => setAlert(null)}
                className="text-xs underline decoration-dotted"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* DETAIL VIEW */}
          {selectedEmployee ? (
            <div className="bg-white/90 rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-[#e5e7f5] p-5 md:p-6 space-y-6">
              <div className="flex items-center justify-between gap-3 border-b border-[#e5e7f5] pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={backToList}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <FiArrowLeft className="text-slate-700" size={16} />
                  </button>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Employee Detail
                    </p>
                    <h2 className="text-base md:text-lg font-semibold text-slate-900">
                      {selectedEmployee.fname} {selectedEmployee.lname}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Emp ID: {selectedEmployee.empid}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/admin/edit_employee/${selectedEmployee.empid}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-2xl text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-50"
                >
                  Edit Details
                </Link>
              </div>

              {/* Info sections */}
              <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
                    Personal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <Field label="Name">
                      {selectedEmployee.fname} {selectedEmployee.lname}
                    </Field>
                    <Field label="Email">{selectedEmployee.email}</Field>
                    <Field label="Mobile">
                      {selectedEmployee.mobile || "N/A"}
                    </Field>
                    <Field label="Gender">
                      {selectedEmployee.gender || "N/A"}
                    </Field>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
                    Employment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <Field label="Department">
                      {selectedEmployee.department?.dept_name || "N/A"}
                    </Field>
                    <Field label="Designation">
                      {selectedEmployee.designation || "N/A"}
                    </Field>
                    <Field label="Type">
                      {selectedEmployee.employee_type || "N/A"}
                    </Field>
                    <Field label="Location">
                      {selectedEmployee.location || "N/A"}
                    </Field>
                    <Field label="Prev. Experience">
                      {(selectedEmployee.prev_total_exp ?? 0) + " yrs"}
                    </Field>
                    <Field label="Total Experience">
                      {selectedEmployee.total_experience
                        ? `${selectedEmployee.total_experience} yrs`
                        : "N/A"}
                    </Field>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
                    Dates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <Field label="Date of Joining">
                      {selectedEmployee.doj || "N/A"}
                    </Field>
                    <Field label="Last Working Day">
                      {selectedEmployee.lwd || "Ongoing"}
                    </Field>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] mb-3">
                    Access / Approvals
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <Field label="Approver ID">
                      {selectedEmployee.approver_id || "N/A"}
                    </Field>
                    <Field label="Company">
                      {selectedEmployee.company || "NTS"}
                    </Field>
                  </div>
                </section>
              </div>

              {/* Client Assignments */}
              <section className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                    Client Assignments
                  </h3>
                </div>
                {clientDetails && clientDetails.length ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                    <table className="min-w-full text-xs">
                      <thead className="bg-[#F3F5FF]">
                        <tr className="text-[11px] text-slate-600">
                          <th className="px-3 py-2 text-left font-medium">
                            Client ID
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            Client Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            Start Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            End Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientDetails.map((d, i) => (
                          <tr
                            key={i}
                            className="hover:bg-[#F8F9FF] transition border-t border-slate-100"
                          >
                            <td className="px-3 py-2">{d.client?.clientID}</td>
                            <td className="px-3 py-2">{d.client?.client_name}</td>
                            <td className="px-3 py-2">{d.assignment?.start_date}</td>
                            <td className="px-3 py-2">
                              {d.assignment?.end_date || "Ongoing"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    No client assignments found.
                  </p>
                )}
              </section>
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
              {/* Card header bar (like View Clients / Projects) */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                    <FiUsers className="w-6 h-6 text-[#4C6FFF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Employee List
                    </h2>
                    <p className="text-sm text-slate-500">
                      View, filter and manage all employees.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <a
                    href={csvUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-medium shadow-sm hover:bg-slate-900"
                  >
                    <FiDownload className="text-[13px]" />
                    Export CSV
                  </a>
                  <Link
                    to="/addemployee"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:bg-slate-50"
                  >
                    <FiPlus className="text-[13px]" />
                    Add Employee
                  </Link>
                </div>
              </div>

              {/* Top controls: search + status + filter toggle */}
              <div className="px-6 py-4 border-b border-[#e5e7f5] bg-white/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                      <FiSearch
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={15}
                      />
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by name, email, dept..."
                        className="w-full pl-8 pr-3 py-2 rounded-2xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#4C6FFF] focus:border-[#4C6FFF] outline-none bg-[#F8F9FF]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded-2xl px-3 py-2 bg-[#F8F9FF] focus:outline-none focus:ring-1 focus:ring-[#4C6FFF]"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFilters((s) => !s)}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50/70 hover:bg-slate-100"
                    >
                      <FiFilter className="text-[13px]" />
                      Filters
                    </button>
                    <a
                      href={csvUrl}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50"
                    >
                      <FiDownload className="text-[13px]" />
                      CSV
                    </a>
                    <Link
                      to="/addemployee"
                      className="hidden md:inline-flex items-center gap-1.5 rounded-2xl bg-[#4C6FFF] text-white px-3.5 py-1.5 text-xs font-medium shadow-sm hover:bg-[#3f59e0]"
                    >
                      <FiPlus className="text-[13px]" />
                      Add Employee
                    </Link>
                  </div>
                </div>

                {/* Filters panel */}
                {showFilters && (
                  <form
                    onSubmit={applyFilters}
                    className="mt-4 rounded-2xl border border-slate-100 bg-[#F8F9FF] px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-3"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Department
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) =>
                          setSelectedDepartment(e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.dept_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Approver
                      </label>
                      <select
                        value={selectedApprover}
                        onChange={(e) =>
                          setSelectedApprover(e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      >
                        <option value="">All Approvers</option>
                        {approvers.map((a) => (
                          <option
                            key={a.approver_id ?? a.id}
                            value={a.approver_id ?? a.id}
                          >
                            {a.fname} {a.lname} ({a.approver_id ?? a.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs border border-slate-200 bg-white hover:bg-slate-100"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-medium bg-[#4C6FFF] text-white shadow-sm hover:bg-[#3f59e0]"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* TABLE (styled like View Clients) */}
              <div className="px-6 pb-6 pt-3">
                <p className="text-[11px] text-slate-400 mb-2">
                  {filteredEmployees.length} record(s) found
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs divide-y divide-[#e5e7f5]">
                    <thead className="bg-[#F3F5FF]">
                      <tr className="text-[11px] text-slate-600">
                        <th className="px-3 py-2 text-left font-medium">Emp ID</th>
                        <th className="px-3 py-2 text-left font-medium">Name</th>
                        <th className="px-3 py-2 text-left font-medium">Department</th>
                        <th className="px-3 py-2 text-left font-medium">Designation</th>
                        <th className="px-3 py-2 text-left font-medium">Email</th>
                        <th className="px-3 py-2 text-left font-medium">DOJ</th>
                        <th className="px-3 py-2 text-left font-medium">End Date</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                        <th className="px-3 py-2 text-left font-medium">Approver</th>
                        <th className="px-3 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                            Loading employees...
                          </td>
                        </tr>
                      ) : filteredEmployees.length ? (
                        filteredEmployees.map((emp) => {
                          const isInactive = emp.lwd && new Date(emp.lwd) <= new Date();
                          return (
                            <tr
                              key={emp.empid}
                              className="hover:bg-[#F8F9FF] transition border-b border-slate-100"
                            >
                              <td className="px-3 py-2 align-middle">
                                <span className="font-medium text-slate-800">{emp.empid}</span>
                              </td>
                              <td className="px-3 py-2 align-middle">{emp.fname} {emp.lname}</td>
                              <td className="px-3 py-2 align-middle">{emp.department?.dept_name || "N/A"}</td>
                              <td className="px-3 py-2 align-middle">{emp.designation}</td>
                              <td className="px-3 py-2 align-middle">{emp.email}</td>
                              <td className="px-3 py-2 align-middle">{emp.doj || "N/A"}</td>
                              <td className="px-3 py-2 align-middle">{emp.lwd || "Ongoing"}</td>
                              <td className="px-3 py-2 align-middle">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                  isInactive ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isInactive ? "bg-rose-500" : "bg-emerald-500"}`} />
                                  {isInactive ? "Inactive" : "Active"}
                                </span>
                              </td>
                              <td className="px-3 py-2 align-middle">{emp.approver_id}</td>
                              <td className="px-3 py-2 align-middle">
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => viewEmployee(emp.empid)}
                                    className="inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] bg-slate-900 text-white hover:bg-slate-800"
                                  >
                                    View
                                  </button>
                                  <Link
                                    to={`/editemployee/${emp.empid}`}
                                    className="inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-50"
                                  >
                                    Edit
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                            No employees found for the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
