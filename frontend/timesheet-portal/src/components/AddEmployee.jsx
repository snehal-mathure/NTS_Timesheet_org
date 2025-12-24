
// // src/pages/AddEmployeePage.jsx
// import React, { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";
// import employeeService from "../services/AdminDashboard/employeeService";
// import Sidebar from "../components/Sidebar";
// import PageHeader from "../components/PageHeader";
// import { FiUsers } from "react-icons/fi";
// import { FiCheckCircle, FiX } from "react-icons/fi";

// const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

// /* ---------------- Toast Component ---------------- */
// const Toast = ({ type, message, onClose }) => {
//   if (!message) return null;

//   return (
//     <div
//       className={`bg-white border-l-4 shadow-lg rounded-xl p-4 max-w-sm flex gap-3
//         ${type === "success" ? "border-emerald-500" : "border-rose-500"}`}
//     >
//       {type === "success" ? (
//         <FiCheckCircle className="text-emerald-500 mt-1" />
//       ) : (
//         <FiX className="text-rose-500 mt-1" />
//       )}

//       <div className="flex-1">
//         <p className="text-sm font-semibold">
//           {type === "success" ? "Success" : "Error"}
//         </p>
//         <p className="text-xs text-slate-600">{message}</p>
//       </div>

//       <button
//         onClick={onClose}
//         className="text-slate-400 hover:text-slate-700"
//       >
//         <FiX size={14} />
//       </button>
//     </div>
//   );
// };

// export default function AddEmployeePage() {
//   const [loading, setLoading] = useState(false);
//   const [formDataLoaded, setFormDataLoaded] = useState(false);

//   // fetched form data
//   const [clients, setClients] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [leaveTypes, setLeaveTypes] = useState([]);

//   // form state
//   const [form, setForm] = useState({
//     empid: "",
//     fname: "",
//     lname: "",
//     gender: "",
//     email: "",
//     mobile: "",
//     dept_id: "", // can be id, "custom", or "edit"
//     custom_dept: "",
//     edit_dept_id: "",
//     new_dept_name: "",
//     designation: "",
//     employee_type: "",
//     prev_total_exp: "",
//     calculated_total_exp: "",
//     company: "",
//     location: "",
//     work_location: "",
//     city: "",
//     core_skill: "",
//     skill_details: "",
//     doj: "",
//     lwd: "",
//     approver_id: "",
//     password: "",
//   });

//   // client assignments: { clientID: { checked: bool, start_date: '', end_date: '' } }
//   const [clientAssignments, setClientAssignments] = useState({});

//   // leave balances: { leave_id: value }
//   const [leaveBalances, setLeaveBalances] = useState({});

//   // UI state
//   const [showSuccess, setShowSuccess] = useState("");
//   const [showError, setShowError] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);

//   const formRef = useRef(null);

//   // track sidebar collapsed state so main content margin adjusts
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(
//     () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
//   );


//   // update layout if sidebar toggled elsewhere (same-tab event)
//   useEffect(() => {
//     const handler = () => {
//       setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
//     };

//     window.addEventListener("td_sidebar_change", handler);
//     window.addEventListener("storage", handler);

//     return () => {
//       window.removeEventListener("td_sidebar_change", handler);
//       window.removeEventListener("storage", handler);
//     };
//   }, []);

//   useEffect(() => {
//     if (showSuccess || showError) {
//       const t = setTimeout(() => {
//         setShowSuccess("");
//         setShowError("");
//       }, 3000);
//       return () => clearTimeout(t);
//     }
//   }, [showSuccess, showError]);


//   // load form data from API
//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await employeeService.getFormData();
//         setClients(res.clients || []);
//         setDepartments(res.departments || []);
//         setLeaveTypes(res.leave_types || []);

//         const initialClientAssignments = {};
//         (res.clients || []).forEach((c) => {
//           initialClientAssignments[c.clientID] = {
//             checked: false,
//             start_date: "",
//             end_date: "",
//           };
//         });
//         setClientAssignments(initialClientAssignments);

//         const initialLeaves = {};
//         (res.leave_types || []).forEach((l) => {
//           initialLeaves[l.leave_id] = "0";
//         });
//         setLeaveBalances(initialLeaves);

//         setFormDataLoaded(true);
//       } catch (err) {
//         setShowError("Failed to load form data. Check server connection.");
//       }
//     }
//     load();
//   }, []);

//   // update generic form fields
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   // client checkbox toggle
//   const handleClientCheckbox = (clientID, checked) => {
//     setClientAssignments((p) => ({
//       ...p,
//       [clientID]: {
//         ...p[clientID],
//         checked,
//         start_date: checked ? p[clientID].start_date : "",
//         end_date: checked ? p[clientID].end_date : "",
//       },
//     }));
//   };

//   // client date change
//   const handleClientDateChange = (clientID, field, value) => {
//     setClientAssignments((p) => ({
//       ...p,
//       [clientID]: {
//         ...p[clientID],
//         [field]: value,
//       },
//     }));
//   };

//   // leave balance change
//   const handleLeaveChange = (leaveId, value) => {
//     setLeaveBalances((p) => ({ ...p, [leaveId]: value }));
//   };

//   // dept select handler
//   const handleDeptChange = (val) => {
//     setForm((p) => ({
//       ...p,
//       dept_id: val,
//       ...(val !== "custom" && { custom_dept: "" }),
//       ...(val !== "edit" && { edit_dept_id: "", new_dept_name: "" }),
//     }));
//   };

//   // calculate total experience
//   const calculateTotalExperience = () => {
//     const prevExp = parseFloat(form.prev_total_exp || "0") || 0;
//     if (!form.doj) {
//       const total = parseFloat(prevExp).toFixed(1);
//       setForm((p) => ({ ...p, calculated_total_exp: total }));
//       return total;
//     }
//     try {
//       const dojDate = new Date(form.doj);
//       const today = new Date();
//       let years = today.getFullYear() - dojDate.getFullYear();
//       let months = today.getMonth() - dojDate.getMonth();
//       if (today.getDate() < dojDate.getDate()) {
//         months -= 1;
//       }
//       if (months < 0) {
//         years -= 1;
//         months += 12;
//       }
//       const companyExp = years + months / 12;
//       const total = parseFloat(prevExp + companyExp).toFixed(1);
//       setForm((p) => ({ ...p, calculated_total_exp: total }));
//       return total;
//     } catch (e) {
//       setForm((p) => ({ ...p, calculated_total_exp: prevExp.toString() }));
//       return prevExp.toString();
//     }
//   };

//   useEffect(() => {
//     calculateTotalExperience();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [form.prev_total_exp, form.doj]);

//   // validate form
//   const validateForm = () => {
//     const required = [
//       "empid",
//       "fname",
//       "lname",
//       "email",
//       "designation",
//       "mobile",
//       "gender",
//       "employee_type",
//       "location",
//       "company",
//       "doj",
//       "approver_id",
//       "secondary_approver_id",

//       "password",
//     ];

//     for (const field of required) {
//       if (!form[field] || form[field].toString().trim() === "") {
//         setShowError(`${field.replace(/_/g, " ")} is required.`);
//         return false;
//       }
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(form.email)) {
//       setShowError("Invalid email format.");
//       return false;
//     }

//     const mobileRegex = /^\d{10}$/;
//     if (!mobileRegex.test(form.mobile)) {
//       setShowError("Mobile number must be 10 digits.");
//       return false;
//     }

//     if (form.dept_id === "custom") {
//       if (!form.custom_dept || form.custom_dept.trim() === "") {
//         setShowError("New department name is required.");
//         return false;
//       }
//     } else if (form.dept_id === "edit") {
//       if (
//         !form.edit_dept_id ||
//         !form.new_dept_name ||
//         form.new_dept_name.trim() === ""
//       ) {
//         setShowError(
//           "To edit department, choose department and provide new name."
//         );
//         return false;
//       }
//     }

//     const selectedClients = Object.keys(clientAssignments).filter(
//       (k) => clientAssignments[k] && clientAssignments[k].checked
//     );

//     if (selectedClients.length === 0) {
//       setShowError("Please select at least one client.");
//       return false;
//     }

//     let dojDate = null;
//     if (form.doj) dojDate = new Date(form.doj);

//     for (const clientId of selectedClients) {
//       const entry = clientAssignments[clientId];
//       if (!entry.start_date) {
//         setShowError("Start date is required for selected clients.");
//         return false;
//       }
//       const sd = new Date(entry.start_date);
//       if (dojDate && sd < dojDate) {
//         setShowError("Client start date cannot be before date of joining.");
//         return false;
//       }
//       if (entry.end_date) {
//         const ed = new Date(entry.end_date);
//         if (ed <= sd) {
//           setShowError("Client end date must be after the start date.");
//           return false;
//         }
//       }
//     }

//     if (form.password.length < 8) {
//       setShowError("Password must be at least 8 characters long.");
//       return false;
//     }

//     for (const [, val] of Object.entries(leaveBalances)) {
//       if (val === "" || isNaN(Number(val)) || Number(val) < 0) {
//         setShowError("Leave balances must be numbers >= 0.");
//         return false;
//       }
//     }

//     setShowError("");
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setShowSuccess("");
//     setShowError("");

//     if (!validateForm()) return;

//     const client_assignments_payload = {};
//     for (const [clientId, entry] of Object.entries(clientAssignments)) {
//       if (entry.checked) {
//         client_assignments_payload[clientId] = {
//           start_date: entry.start_date,
//           end_date: entry.end_date || "",
//         };
//       }
//     }

//     const leave_balances_payload = {};
//     for (const [lid, val] of Object.entries(leaveBalances)) {
//       leave_balances_payload[lid] = val || "0";
//     }

//     const payload = {
//       ...form,
//       prev_total_exp: form.prev_total_exp || "",
//       calculated_total_exp: form.calculated_total_exp || "",
//       client_assignments: client_assignments_payload,
//       leave_balances: leave_balances_payload,
//     };

//     try {
//       setLoading(true);
//       const res = await employeeService.addEmployee(payload);
//       if (res && res.status === "success") {
//         setShowSuccess(res.message || "Employee added successfully.");

//         setForm({
//           empid: "",
//           fname: "",
//           lname: "",
//           gender: "",
//           email: "",
//           mobile: "",
//           dept_id: "",
//           custom_dept: "",
//           edit_dept_id: "",
//           new_dept_name: "",
//           designation: "",
//           employee_type: "",
//           prev_total_exp: "",
//           calculated_total_exp: "",
//           company: "",
//           location: "",
//           work_location: "",
//           city: "",
//           core_skill: "",
//           skill_details: "",
//           doj: "",
//           lwd: "",
//           approver_id: "",
//           secondary_approver_id: "",
//           password: "",
//         });

//         const resetClients = {};
//         clients.forEach((c) => {
//           resetClients[c.clientID] = {
//             checked: false,
//             start_date: "",
//             end_date: "",
//           };
//         });
//         setClientAssignments(resetClients);

//         const resetLeaves = {};
//         leaveTypes.forEach((l) => {
//           resetLeaves[l.leave_id] = "0";
//         });
//         setLeaveBalances(resetLeaves);

//         window.scrollTo({ top: 0, behavior: "smooth" });
//         setTimeout(() => setShowSuccess(""), 5000);
//       } else {
//         setShowError(res.message || "Failed to add employee.");
//       }
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Server error while adding employee.";
//       setShowError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isCustomDept = form.dept_id === "custom";
//   const isEditDept = form.dept_id === "edit";

//   const accent = "#4C6FFF";

//   // compute main margin:
//   // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
//   // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
//   const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

//   // SCROLL LOGIC:
//   // outer: h-screen + overflow-hidden
//   // sidebar: h-full + overflow-y-auto
//   // main: h-full + overflow-y-auto
//   return (
//     <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#F5F7FF" }}>
//       {/* FIXED SIDEBAR */}
//       <aside className="fixed left-0 top-0 bottom-0 z-30">
//         <div className={`h-screen ${sidebarCollapsed ? "w-20" : "w-72"}`}>
//           <Sidebar />
//         </div>
//       </aside>

//       {/* MAIN CONTENT (scrollable) */}
//       <main className={`flex-1 h-full overflow-y-auto px-4 md:px-10 py-6 md:py-2 transition-all duration-200 ${mainMarginClass}`}>
//         <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
//           {/* Page header (same style as other pages) */}
//           <PageHeader
//             section="Employees"
//             title="Add New Employee"
//             description="Create a new employee, assign clients and configure leave balances."
//           />

//           {/* Alerts
//           {showError && (
//             <div className="mb-4 rounded-2xl px-4 py-3 text-sm bg-rose-50 text-rose-800 border border-rose-100 flex items-center justify-between">
//               <span>{showError}</span>
//               <button
//                 onClick={() => setShowError("")}
//                 className="text-xs underline decoration-dotted"
//               >
//                 Dismiss
//               </button>
//             </div>
//           )}
//           {showSuccess && (
//             <div className="mb-4 rounded-2xl px-4 py-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-between">
//               <span>{showSuccess}</span>
//               <button
//                 onClick={() => setShowSuccess("")}
//                 className="text-xs underline decoration-dotted"
//               >
//                 Dismiss
//               </button>
//             </div>
//           )} */}

//           {/* TOAST CONTAINER */}
//           <div className="fixed top-5 right-5 z-50 space-y-3">
//             {showSuccess && (
//               <Toast
//                 type="success"
//                 message={showSuccess}
//                 onClose={() => setShowSuccess("")}
//               />
//             )}

//             {showError && (
//               <Toast
//                 type="error"
//                 message={showError}
//                 onClose={() => setShowError("")}
//               />
//             )}
//           </div>

//           {/* Main card */}
//           <div className="bg-white/90 rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-[#e5e7f5] overflow-hidden">
//             {/* Card header bar similar to other pages */}
//             <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//               <div className="flex items-center gap-4">
//                 <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                   <FiUsers className="w-6 h-6 text-[#4C6FFF]" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-slate-900">Employee Details</h2>
//                   <p className="text-sm text-slate-500">Fill in the employee’s personal, employment and access details.</p>
//                 </div>
//               </div>

//               <Link to="/listemployee" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#d0d4ff] text-xs font-medium text-slate-700 bg-white hover:bg-[#eef0ff] hover:border-[#b8bdff] hover:text-slate-900 transition">

//                 View All Employees
//               </Link>
//             </div>

//             {/* Form body */}
//             <div className="px-6 py-6 md:py-7">
//               {!formDataLoaded ? (
//                 <div className="text-center py-8 text-sm text-slate-500">Loading form data...</div>
//               ) : (
//                 <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
//                   {/* --- PERSONAL INFORMATION --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Personal Information</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Employee ID <span className="text-rose-600">*</span></label>
//                         <input name="empid" value={form.empid} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter employee ID" pattern="[A-Z0-9]+" title="Employee ID should contain only uppercase letters and numbers" required />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">First Name <span className="text-rose-600">*</span></label>
//                         <input name="fname" value={form.fname} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter first name" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Last Name <span className="text-rose-600">*</span></label>
//                         <input name="lname" value={form.lname} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter last name" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Gender <span className="text-rose-600">*</span></label>
//                         <select name="gender" value={form.gender} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
//                           <option value="">Select Gender</option>
//                           <option value="Male">Male</option>
//                           <option value="Female">Female</option>
//                           <option value="Other">Other</option>
//                         </select>
//                       </div>
//                     </div>
//                   </section>

//                   {/* --- CONTACT INFORMATION --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Contact Information</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Email <span className="text-rose-600">*</span></label>
//                         <input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter email" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Mobile Number <span className="text-rose-600">*</span></label>
//                         <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} pattern="\d{10}" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter 10-digit mobile number" />
//                       </div>
//                     </div>
//                   </section>

//                   {/* --- EMPLOYMENT DETAILS --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Employment Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Department <span className="text-rose-600">*</span></label>
//                         <select name="dept_id" value={form.dept_id} onChange={(e) => handleDeptChange(e.target.value)} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
//                           <option value="">Select department</option>
//                           {departments.map((d) => (<option key={d.id} value={d.id}>{d.dept_name}</option>))}
//                           <option value="custom">+ Add New Department</option>
//                           <option value="edit">✏️ Edit Existing Department</option>
//                         </select>
//                       </div>

//                       {isCustomDept && (
//                         <div>
//                           <label className="block text-xs font-medium text-slate-600">New Department Name <span className="text-rose-600">*</span></label>
//                           <input name="custom_dept" value={form.custom_dept} onChange={handleChange} required={isCustomDept} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter new department name" />
//                         </div>
//                       )}

//                       {isEditDept && (
//                         <div className="space-y-2 md:col-span-2">
//                           <div>
//                             <label className="block text-xs font-medium text-slate-600">Select Department to Edit <span className="text-rose-600">*</span></label>
//                             <select name="edit_dept_id" value={form.edit_dept_id} onChange={handleChange} required={isEditDept} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
//                               <option value="">-- Choose Department --</option>
//                               {departments.map((d) => (<option key={d.id} value={d.id}>{d.dept_name}</option>))}
//                             </select>
//                           </div>
//                           <div>
//                             <label className="block text-xs font-medium text-slate-600">New Name for Department <span className="text-rose-600">*</span></label>
//                             <input name="new_dept_name" value={form.new_dept_name} onChange={handleChange} required={isEditDept} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter new department name" />
//                           </div>
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Designation <span className="text-rose-600">*</span></label>
//                         <input name="designation" value={form.designation} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter designation" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Employee Type <span className="text-rose-600">*</span></label>
//                         <select name="employee_type" value={form.employee_type} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
//                           <option value="">Select Employee Type</option>
//                           <option value="Employee">Employee</option>
//                           <option value="Contractor">Contractor</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Previous Experience (Years)</label>
//                         <input name="prev_total_exp" type="number" step="0.1" min="0" value={form.prev_total_exp} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter experience in years" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Total Experience as on Date</label>
//                         <input name="calculated_total_exp" value={form.calculated_total_exp ? `${form.calculated_total_exp} years` : ""} readOnly className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-100" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Company <span className="text-rose-600">*</span></label>
//                         <select name="company" value={form.company} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
//                           <option value="">Select Company</option>
//                           <option value="NTS India">NTS India</option>
//                           <option value="NTS Dubai">NTS Dubai</option>
//                           <option value="NTS US">NTS US</option>
//                           <option value="NTS Costa Rica">NTS Costa Rica</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Location <span className="text-rose-600">*</span></label>
//                         <select name="location" value={form.location} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
//                           <option value="">Select Location</option>
//                           <option value="Onsite">Onsite</option>
//                           <option value="Offshore">Offshore</option>
//                           <option value="Nearshore">Nearshore</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Work Location (Country)</label>
//                         <input name="work_location" value={form.work_location} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter work location" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">City</label>
//                         <input name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter city" />
//                       </div>
//                     </div>
//                   </section>

//                   {/* --- SKILLS & EXPERTISE --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Skills & Expertise</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Core Skill</label>
//                         <input name="core_skill" value={form.core_skill} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter core skill" />
//                       </div>

//                       <div className="md:col-span-2">
//                         <label className="block text-xs font-medium text-slate-600">Skill Details</label>
//                         <textarea name="skill_details" value={form.skill_details} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter detailed skills information" rows={3} />
//                       </div>
//                     </div>
//                   </section>

//                   {/* --- IMPORTANT DATES --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Important Dates</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Date of Joining <span className="text-rose-600">*</span></label>
//                         <input name="doj" type="date" value={form.doj} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Last Working Day</label>
//                         <input name="lwd" type="date" value={form.lwd} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" />
//                       </div>
//                     </div>
//                   </section>

//                   {/* --- ACCESS INFORMATION --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Access Information</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-xs font-medium text-slate-600">Approver ID <span className="text-rose-600">*</span></label>
//                         <input name="approver_id" value={form.approver_id} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter approver ID" />
//                       </div>
//                       <div>
//                           <label className="block text-xs font-medium text-slate-600">
//                             Secondary Approver ID <span className="text-slate-400">(Optional)</span>
//                           </label>
//                           <input
//                             name="secondary_approver_id"
//                             value={form.secondary_approver_id}
//                             onChange={handleChange}
//                             className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white 
//                                       focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
//                             placeholder="Enter secondary approver ID (optional)"
//                           />
//                         </div>


//                       <div className="relative">
//                         <label className="block text-xs font-medium text-slate-600">Set Password <span className="text-rose-600">*</span></label>
//                         <input name="password" type={passwordVisible ? "text" : "password"} value={form.password} onChange={handleChange} required minLength={8} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 pr-12 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter password" />
//                         <button type="button" onClick={() => setPasswordVisible((p) => !p)} className="absolute right-3 top-8 text-[11px] text-slate-600" aria-label="toggle password">
//                           {passwordVisible ? "Hide" : "Show"}
//                         </button>
//                       </div>
//                     </div>
//                   </section>

//                   {/* --- CLIENT ASSIGNMENT --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Client Assignment <span className="text-rose-600">*</span></h2>
//                     <div className="space-y-2">
//                       {clients.map((client) => {
//                         const assign = clientAssignments[client.clientID] || { checked: false, start_date: "", end_date: "" };
//                         return (
//                           <div key={client.clientID} className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
//                             <div className="flex items-center justify-between">
//                               <label className="flex items-center gap-2 text-sm text-slate-800">
//                                 <input id={`client_${client.clientID}`} name="clients" type="checkbox" value={client.clientID} checked={assign.checked} onChange={(e) => handleClientCheckbox(client.clientID, e.target.checked)} className="rounded border-slate-300" />
//                                 <span>{client.client_name}</span>
//                               </label>
//                             </div>

//                             {assign.checked && (
//                               <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                   <label className="block text-xs font-medium text-slate-600">Start Date <span className="text-rose-600">*</span></label>
//                                   <input id={`start_date_${client.clientID}`} name={`start_date_${client.clientID}`} type="date" value={assign.start_date} onChange={(e) => handleClientDateChange(client.clientID, "start_date", e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" required />
//                                 </div>

//                                 <div>
//                                   <label className="block text-xs font-medium text-slate-600">End Date</label>
//                                   <input id={`end_date_${client.clientID}`} name={`end_date_${client.clientID}`} type="date" value={assign.end_date} onChange={(e) => handleClientDateChange(client.clientID, "end_date", e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" />
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </section>

//                   {/* --- ASSIGN LEAVES --- */}
//                   <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
//                     <h2 className="font-semibold mb-3 text-sm text-slate-800">Assign Leaves</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {leaveTypes.map((leave) => (
//                         <div key={leave.leave_id}>
//                           <label className="block text-xs font-medium text-slate-600">{leave.leave_type} <span className="text-rose-600">*</span></label>
//                           <input type="number" min="0" name={`leave_${leave.leave_id}`} value={leaveBalances[leave.leave_id] || "0"} onChange={(e) => handleLeaveChange(leave.leave_id, e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder={`Enter ${leave.leave_type} balance`} />
//                         </div>
//                       ))}
//                     </div>
//                   </section>

//                   {/* Actions */}
//                   <div className="flex justify-end gap-3 pt-2 border-t border-[#e5e7f5] mt-2">
//                     <Link to="/listemployee" className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition">Cancel</Link>
//                     <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[rgba(76,111,255,0.35)]" style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}>
//                       {loading ? "Saving..." : "Add Employee"}
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }





// src/pages/AddEmployeePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import employeeService from "../services/AdminDashboard/employeeService";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import { FiUsers } from "react-icons/fi";
import { FiCheckCircle, FiX } from "react-icons/fi";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

/* ---------------- Toast Component ---------------- */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-white border-l-4 shadow-lg rounded-xl p-4 max-w-sm flex gap-3
        ${type === "success" ? "border-emerald-500" : "border-rose-500"}`}
    >
      {type === "success" ? (
        <FiCheckCircle className="text-emerald-500 mt-1" />
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

export default function AddEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  // fetched form data
  const [clients, setClients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  // job roles
  const [jobRoles, setJobRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);


  // form state
  const [form, setForm] = useState({
    empid: "",
    fname: "",
    lname: "",
    gender: "",
    email: "",
    mobile: "",
    dept_id: "", // can be id, "custom", or "edit"
    custom_dept: "",
    edit_dept_id: "",
    new_dept_name: "",
    designation: "",
    employee_type: "",
    prev_total_exp: "",
    calculated_total_exp: "",
    company: "",
    location: "",
    work_location: "",
    city: "",
    core_skill: "",
    skill_details: "",
    doj: "",
    lwd: "",
    approver_id: "",
    password: "",
    job_role_id: "",
    custom_job_role: "",

  });

  // client assignments: { clientID: { checked: bool, start_date: '', end_date: '' } }
  const [clientAssignments, setClientAssignments] = useState({});

  // leave balances: { leave_id: value }
  const [leaveBalances, setLeaveBalances] = useState({});

  // UI state
  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const formRef = useRef(null);

  // track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );


  useEffect(() => {
    if (!form.dept_id || form.dept_id === "custom" || form.dept_id === "edit") {
      setJobRoles([]);
      setForm((p) => ({ ...p, job_role_id: "", custom_job_role: "" }));
      return;
    }

    async function fetchRoles() {
      try {
        setLoadingRoles(true);
        const res = await employeeService.getJobRolesByDepartment(form.dept_id);
        setJobRoles(res.roles || []);
      } catch {
        setJobRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    }

    fetchRoles();
  }, [form.dept_id]);



  // update layout if sidebar toggled elsewhere (same-tab event)
  useEffect(() => {
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
    if (showSuccess || showError) {
      const t = setTimeout(() => {
        setShowSuccess("");
        setShowError("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [showSuccess, showError]);


  // load form data from API
  useEffect(() => {
    async function load() {
      try {
        const res = await employeeService.getFormData();
        setClients(res.clients || []);
        setDepartments(res.departments || []);
        setLeaveTypes(res.leave_types || []);

        const initialClientAssignments = {};
        (res.clients || []).forEach((c) => {
          initialClientAssignments[c.clientID] = {
            checked: false,
            start_date: "",
            end_date: "",
          };
        });
        setClientAssignments(initialClientAssignments);

        const initialLeaves = {};
        (res.leave_types || []).forEach((l) => {
          initialLeaves[l.leave_id] = "0";
        });
        setLeaveBalances(initialLeaves);

        setFormDataLoaded(true);
      } catch (err) {
        setShowError("Failed to load form data. Check server connection.");
      }
    }
    load();
  }, []);


  const handleJobRoleChange = (value) => {
    setForm((p) => ({
      ...p,
      job_role_id: value,
      custom_job_role: value === "custom" ? p.custom_job_role : "",
    }));
  };


  // update generic form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // client checkbox toggle
  const handleClientCheckbox = (clientID, checked) => {
    setClientAssignments((p) => ({
      ...p,
      [clientID]: {
        ...p[clientID],
        checked,
        start_date: checked ? p[clientID].start_date : "",
        end_date: checked ? p[clientID].end_date : "",
      },
    }));
  };

  // client date change
  const handleClientDateChange = (clientID, field, value) => {
    setClientAssignments((p) => ({
      ...p,
      [clientID]: {
        ...p[clientID],
        [field]: value,
      },
    }));
  };

  // leave balance change
  const handleLeaveChange = (leaveId, value) => {
    setLeaveBalances((p) => ({ ...p, [leaveId]: value }));
  };

  // dept select handler
  const handleDeptChange = (val) => {
    setForm((p) => ({
      ...p,
      dept_id: val,
      ...(val !== "custom" && { custom_dept: "" }),
      ...(val !== "edit" && { edit_dept_id: "", new_dept_name: "" }),
    }));
  };

  // calculate total experience
  const calculateTotalExperience = () => {
    const prevExp = parseFloat(form.prev_total_exp || "0") || 0;
    if (!form.doj) {
      const total = parseFloat(prevExp).toFixed(1);
      setForm((p) => ({ ...p, calculated_total_exp: total }));
      return total;
    }
    try {
      const dojDate = new Date(form.doj);
      const today = new Date();
      let years = today.getFullYear() - dojDate.getFullYear();
      let months = today.getMonth() - dojDate.getMonth();
      if (today.getDate() < dojDate.getDate()) {
        months -= 1;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const companyExp = years + months / 12;
      const total = parseFloat(prevExp + companyExp).toFixed(1);
      setForm((p) => ({ ...p, calculated_total_exp: total }));
      return total;
    } catch (e) {
      setForm((p) => ({ ...p, calculated_total_exp: prevExp.toString() }));
      return prevExp.toString();
    }
  };

  useEffect(() => {
    calculateTotalExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.prev_total_exp, form.doj]);

  // validate form
  const validateForm = () => {
    const required = [
      "empid",
      "fname",
      "lname",
      "email",
      "designation",
      "mobile",
      "gender",
      "employee_type",
      "location",
      "company",
      "doj",
      "approver_id",
      "secondary_approver_id",

      "password",
    ];

    for (const field of required) {
      if (!form[field] || form[field].toString().trim() === "") {
        setShowError(`${field.replace(/_/g, " ")} is required.`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setShowError("Invalid email format.");
      return false;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(form.mobile)) {
      setShowError("Mobile number must be 10 digits.");
      return false;
    }

    if (!form.job_role_id) {
      setShowError("Job role is required.");
      return false;
    }

    if (form.job_role_id === "custom" && !form.custom_job_role.trim()) {
      setShowError("New job role name is required.");
      return false;
    }

    if (form.dept_id === "custom") {
      if (!form.custom_dept || form.custom_dept.trim() === "") {
        setShowError("New department name is required.");
        return false;
      }
    } else if (form.dept_id === "edit") {
      if (
        !form.edit_dept_id ||
        !form.new_dept_name ||
        form.new_dept_name.trim() === ""
      ) {
        setShowError(
          "To edit department, choose department and provide new name."
        );
        return false;
      }
    }

    const selectedClients = Object.keys(clientAssignments).filter(
      (k) => clientAssignments[k] && clientAssignments[k].checked
    );

    if (selectedClients.length === 0) {
      setShowError("Please select at least one client.");
      return false;
    }

    let dojDate = null;
    if (form.doj) dojDate = new Date(form.doj);

    for (const clientId of selectedClients) {
      const entry = clientAssignments[clientId];
      if (!entry.start_date) {
        setShowError("Start date is required for selected clients.");
        return false;
      }
      const sd = new Date(entry.start_date);
      if (dojDate && sd < dojDate) {
        setShowError("Client start date cannot be before date of joining.");
        return false;
      }
      if (entry.end_date) {
        const ed = new Date(entry.end_date);
        if (ed <= sd) {
          setShowError("Client end date must be after the start date.");
          return false;
        }
      }
    }

    if (form.password.length < 8) {
      setShowError("Password must be at least 8 characters long.");
      return false;
    }

    for (const [, val] of Object.entries(leaveBalances)) {
      if (val === "" || isNaN(Number(val)) || Number(val) < 0) {
        setShowError("Leave balances must be numbers >= 0.");
        return false;
      }
    }

    setShowError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSuccess("");
    setShowError("");

    if (!validateForm()) return;

    const client_assignments_payload = {};
    for (const [clientId, entry] of Object.entries(clientAssignments)) {
      if (entry.checked) {
        client_assignments_payload[clientId] = {
          start_date: entry.start_date,
          end_date: entry.end_date || "",
        };
      }
    }

    const leave_balances_payload = {};
    for (const [lid, val] of Object.entries(leaveBalances)) {
      leave_balances_payload[lid] = val || "0";
    }

    const payload = {
      ...form,
      prev_total_exp: form.prev_total_exp || "",
      calculated_total_exp: form.calculated_total_exp || "",
      client_assignments: client_assignments_payload,
      leave_balances: leave_balances_payload,
    };

    try {
      setLoading(true);
      const res = await employeeService.addEmployee(payload);
      if (res && res.status === "success") {
        setShowSuccess(res.message || "Employee added successfully.");

        setForm({
          empid: "",
          fname: "",
          lname: "",
          gender: "",
          email: "",
          mobile: "",
          dept_id: "",
          custom_dept: "",
          edit_dept_id: "",
          new_dept_name: "",
          designation: "",
          employee_type: "",
          prev_total_exp: "",
          calculated_total_exp: "",
          company: "",
          location: "",
          work_location: "",
          city: "",
          core_skill: "",
          skill_details: "",
          doj: "",
          lwd: "",
          approver_id: "",
          secondary_approver_id: "",
          password: "",
        });

        const resetClients = {};
        clients.forEach((c) => {
          resetClients[c.clientID] = {
            checked: false,
            start_date: "",
            end_date: "",
          };
        });
        setClientAssignments(resetClients);

        const resetLeaves = {};
        leaveTypes.forEach((l) => {
          resetLeaves[l.leave_id] = "0";
        });
        setLeaveBalances(resetLeaves);

        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setShowSuccess(""), 5000);
      } else {
        setShowError(res.message || "Failed to add employee.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Server error while adding employee.";
      setShowError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isCustomDept = form.dept_id === "custom";
  const isEditDept = form.dept_id === "edit";

  const accent = "#4C6FFF";

  // compute main margin:
  // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
  // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  // SCROLL LOGIC:
  // outer: h-screen + overflow-hidden
  // sidebar: h-full + overflow-y-auto
  // main: h-full + overflow-y-auto
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 z-30">
        <div className={`h-screen ${sidebarCollapsed ? "w-20" : "w-72"}`}>
          <Sidebar />
        </div>
      </aside>

      {/* MAIN CONTENT (scrollable) */}
      <main className={`flex-1 h-full overflow-y-auto px-4 md:px-10 py-6 md:py-2 transition-all duration-200 ${mainMarginClass}`}>
        <div className="max-w-5xl w-full mx-auto mt-4 md:mt-6 space-y-5">
          {/* Page header (same style as other pages) */}
          <PageHeader
            section="Employees"
            title="Add New Employee"
            description="Create a new employee, assign clients and configure leave balances."
          />

          {/* Alerts
          {showError && (
            <div className="mb-4 rounded-2xl px-4 py-3 text-sm bg-rose-50 text-rose-800 border border-rose-100 flex items-center justify-between">
              <span>{showError}</span>
              <button
                onClick={() => setShowError("")}
                className="text-xs underline decoration-dotted"
              >
                Dismiss
              </button>
            </div>
          )}
          {showSuccess && (
            <div className="mb-4 rounded-2xl px-4 py-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-between">
              <span>{showSuccess}</span>
              <button
                onClick={() => setShowSuccess("")}
                className="text-xs underline decoration-dotted"
              >
                Dismiss
              </button>
            </div>
          )} */}

          {/* TOAST CONTAINER */}
          <div className="fixed top-5 right-5 z-50 space-y-3">
            {showSuccess && (
              <Toast
                type="success"
                message={showSuccess}
                onClose={() => setShowSuccess("")}
              />
            )}

            {showError && (
              <Toast
                type="error"
                message={showError}
                onClose={() => setShowError("")}
              />
            )}
          </div>

          {/* Main card */}
          <div className="bg-white/90 rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-[#e5e7f5] overflow-hidden">
            {/* Card header bar similar to other pages */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <FiUsers className="w-6 h-6 text-[#4C6FFF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Employee Details</h2>
                  <p className="text-sm text-slate-500">Fill in the employee’s personal, employment and access details.</p>
                </div>
              </div>

              <Link to="/listemployee" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#d0d4ff] text-xs font-medium text-slate-700 bg-white hover:bg-[#eef0ff] hover:border-[#b8bdff] hover:text-slate-900 transition">

                View All Employees
              </Link>
            </div>

            {/* Form body */}
            <div className="px-6 py-6 md:py-7">
              {!formDataLoaded ? (
                <div className="text-center py-8 text-sm text-slate-500">Loading form data...</div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  {/* --- PERSONAL INFORMATION --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Employee ID <span className="text-rose-600">*</span></label>
                        <input name="empid" value={form.empid} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter employee ID" pattern="[A-Z0-9]+" title="Employee ID should contain only uppercase letters and numbers" required />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">First Name <span className="text-rose-600">*</span></label>
                        <input name="fname" value={form.fname} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter first name" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Last Name <span className="text-rose-600">*</span></label>
                        <input name="lname" value={form.lname} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter last name" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Gender <span className="text-rose-600">*</span></label>
                        <select name="gender" value={form.gender} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* --- CONTACT INFORMATION --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Email <span className="text-rose-600">*</span></label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter email" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Mobile Number <span className="text-rose-600">*</span></label>
                        <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} pattern="\d{10}" required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter 10-digit mobile number" />
                      </div>
                    </div>
                  </section>

                  {/* --- EMPLOYMENT DETAILS --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Employment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Department <span className="text-rose-600">*</span></label>
                        <select name="dept_id" value={form.dept_id} onChange={(e) => handleDeptChange(e.target.value)} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
                          <option value="">Select department</option>
                          {departments.map((d) => (<option key={d.id} value={d.id}>{d.dept_name}</option>))}
                          <option value="custom">+ Add New Department</option>
                          <option value="edit">✏️ Edit Existing Department</option>
                        </select>
                      </div>

                      {isCustomDept && (
                        <div>
                          <label className="block text-xs font-medium text-slate-600">New Department Name <span className="text-rose-600">*</span></label>
                          <input name="custom_dept" value={form.custom_dept} onChange={handleChange} required={isCustomDept} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter new department name" />
                        </div>
                      )}

                      {isEditDept && (
                        <div className="space-y-2 md:col-span-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-600">Select Department to Edit <span className="text-rose-600">*</span></label>
                            <select name="edit_dept_id" value={form.edit_dept_id} onChange={handleChange} required={isEditDept} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
                              <option value="">-- Choose Department --</option>
                              {departments.map((d) => (<option key={d.id} value={d.id}>{d.dept_name}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600">New Name for Department <span className="text-rose-600">*</span></label>
                            <input name="new_dept_name" value={form.new_dept_name} onChange={handleChange} required={isEditDept} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter new department name" />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Designation <span className="text-rose-600">*</span></label>
                        <input name="designation" value={form.designation} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter designation" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Employee Type <span className="text-rose-600">*</span></label>
                        <select name="employee_type" value={form.employee_type} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
                          <option value="">Select Employee Type</option>
                          <option value="Employee">Employee</option>
                          <option value="Contractor">Contractor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Previous Experience (Years)</label>
                        <input name="prev_total_exp" type="number" step="0.1" min="0" value={form.prev_total_exp} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter experience in years" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Total Experience as on Date</label>
                        <input name="calculated_total_exp" value={form.calculated_total_exp ? `${form.calculated_total_exp} years` : ""} readOnly className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-100" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Company <span className="text-rose-600">*</span></label>
                        <select name="company" value={form.company} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
                          <option value="">Select Company</option>
                          <option value="NTS India">NTS India</option>
                          <option value="NTS Dubai">NTS Dubai</option>
                          <option value="NTS US">NTS US</option>
                          <option value="NTS Costa Rica">NTS Costa Rica</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Location <span className="text-rose-600">*</span></label>
                        <select name="location" value={form.location} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none">
                          <option value="">Select Location</option>
                          <option value="Onsite">Onsite</option>
                          <option value="Offshore">Offshore</option>
                          <option value="Nearshore">Nearshore</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Work Location (Country)</label>
                        <input name="work_location" value={form.work_location} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter work location" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">City</label>
                        <input name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter city" />
                      </div>
                    </div>
                  </section>

                  {/* --- SKILLS & EXPERTISE --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Skills & Expertise</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>
                          <label className="block text-xs font-medium text-slate-600">
                            Job Role <span className="text-rose-600">*</span>
                          </label>

                          <select
                            value={form.job_role_id}
                            onChange={(e) => handleJobRoleChange(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 
               text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                          >
                            <option value="">
                              {loadingRoles ? "Loading roles..." : "Select Job Role"}
                            </option>

                            {jobRoles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.job_role}
                              </option>
                            ))}

                            <option value="custom">+ Add New Job Role</option>
                          </select>
                        </div>

                        {form.job_role_id === "custom" && (
                          <div>
                            <label className="block text-xs font-medium text-slate-600">
                              New Job Role <span className="text-rose-600">*</span>
                            </label>
                            <input
                              name="custom_job_role"
                              value={form.custom_job_role}
                              onChange={handleChange}
                              required
                              className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 
                 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                              placeholder="Enter new job role"
                            />
                          </div>
                        )}


                      <div>
                        <label className="block text-xs font-medium text-slate-600">Core Skill</label>
                        <input name="core_skill" value={form.core_skill} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter core skill" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600">Skill Details</label>
                        <textarea name="skill_details" value={form.skill_details} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter detailed skills information" rows={3} />
                      </div>

                    </div>
                  </section>

                  {/* --- IMPORTANT DATES --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Important Dates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Date of Joining <span className="text-rose-600">*</span></label>
                        <input name="doj" type="date" value={form.doj} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">Last Working Day</label>
                        <input name="lwd" type="date" value={form.lwd} onChange={handleChange} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" />
                      </div>
                    </div>
                  </section>

                  {/* --- ACCESS INFORMATION --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Access Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Approver ID <span className="text-rose-600">*</span></label>
                        <input name="approver_id" value={form.approver_id} onChange={handleChange} required className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter approver ID" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-600">
                            Secondary Approver ID <span className="text-slate-400">(Optional)</span>
                          </label>
                          <input
                            name="secondary_approver_id"
                            value={form.secondary_approver_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white 
                                      focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none"
                            placeholder="Enter secondary approver ID (optional)"
                          />
                        </div>


                      <div className="relative">
                        <label className="block text-xs font-medium text-slate-600">Set Password <span className="text-rose-600">*</span></label>
                        <input name="password" type={passwordVisible ? "text" : "password"} value={form.password} onChange={handleChange} required minLength={8} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 pr-12 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder="Enter password" />
                        <button type="button" onClick={() => setPasswordVisible((p) => !p)} className="absolute right-3 top-8 text-[11px] text-slate-600" aria-label="toggle password">
                          {passwordVisible ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* --- CLIENT ASSIGNMENT --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Client Assignment <span className="text-rose-600">*</span></h2>
                    <div className="space-y-2">
                      {clients.map((client) => {
                        const assign = clientAssignments[client.clientID] || { checked: false, start_date: "", end_date: "" };
                        return (
                          <div key={client.clientID} className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-sm text-slate-800">
                                <input id={`client_${client.clientID}`} name="clients" type="checkbox" value={client.clientID} checked={assign.checked} onChange={(e) => handleClientCheckbox(client.clientID, e.target.checked)} className="rounded border-slate-300" />
                                <span>{client.client_name}</span>
                              </label>
                            </div>

                            {assign.checked && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600">Start Date <span className="text-rose-600">*</span></label>
                                  <input id={`start_date_${client.clientID}`} name={`start_date_${client.clientID}`} type="date" value={assign.start_date} onChange={(e) => handleClientDateChange(client.clientID, "start_date", e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" required />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-slate-600">End Date</label>
                                  <input id={`end_date_${client.clientID}`} name={`end_date_${client.clientID}`} type="date" value={assign.end_date} onChange={(e) => handleClientDateChange(client.clientID, "end_date", e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* --- ASSIGN LEAVES --- */}
                  <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-4 md:p-5">
                    <h2 className="font-semibold mb-3 text-sm text-slate-800">Assign Leaves</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {leaveTypes.map((leave) => (
                        <div key={leave.leave_id}>
                          <label className="block text-xs font-medium text-slate-600">{leave.leave_type} <span className="text-rose-600">*</span></label>
                          <input type="number" min="0" name={`leave_${leave.leave_id}`} value={leaveBalances[leave.leave_id] || "0"} onChange={(e) => handleLeaveChange(leave.leave_id, e.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#4C6FFF] focus:outline-none" placeholder={`Enter ${leave.leave_type} balance`} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-[#e5e7f5] mt-2">
                    <Link to="/listemployee" className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition">Cancel</Link>
                    <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[rgba(76,111,255,0.35)]" style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}>
                      {loading ? "Saving..." : "Add Employee"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
