// import React, { useState } from "react";

// export default function Sidebar() {
//   const [activeMenu, setActiveMenu] = useState(null);

//   const toggleMenu = (menu) => {
//     setActiveMenu(activeMenu === menu ? null : menu);
//   };

//   return (
//     <aside className="w-64 bg-[#0b4970] min-h-screen text-white p-4">
//       <h2 className="text-lg font-semibold border-b pb-3">Admin Dashboard</h2>

//       <ul className="mt-4 space-y-3">

//         {/* Employees Onboarding */}
//         <li>
//           <button
//             onClick={() => toggleMenu("employees")}
//             className="flex justify-between w-full px-3 py-2 hover:bg-[#0d5a88] rounded"
//           >
//             <span className="flex items-center gap-2">
//               <i className="fas fa-users"></i> Employees Onboarding
//             </span>
//             <i className="fas fa-chevron-down"></i>
//           </button>

//           {activeMenu === "employees" && (
//             <ul className="ml-6 mt-2 text-sm space-y-1">
//               <li><a href="/addemployee" className="hover:underline">Add Employee</a></li>
//               <li><a href="/listemployee" className="hover:underline">View Employees</a></li>
//             </ul>
//           )}
//         </li>

//         {/* Timesheet */}
//         <li>
//           <a href="/dashboard" className="flex px-3 py-2 hover:bg-[#0d5a88] rounded">
//             <i className="fas fa-clock mr-2"></i> Fill Timesheets
//           </a>
//         </li>

//         {/* Clients */}
//         <li>
//           <button
//             onClick={() => toggleMenu("clients")}
//             className="flex justify-between w-full px-3 py-2 hover:bg-[#0d5a88] rounded"
//           >
//             <span className="flex items-center gap-2">
//               <i className="fas fa-briefcase"></i> Clients
//             </span>
//             <i className="fas fa-chevron-down"></i>
//           </button>

//           {activeMenu === "clients" && (
//             <ul className="ml-6 mt-2 text-sm space-y-1">
//               <li><a href="/add-client" className="hover:underline">Add Client</a></li>
//               <li><a href="/view-clients" className="hover:underline">View Clients</a></li>
//             </ul>
//           )}
//         </li>

//         {/* Projects */}
//         <li>
//           <button
//             onClick={() => toggleMenu("projects")}
//             className="flex justify-between w-full px-3 py-2 hover:bg-[#0d5a88] rounded"
//           >
//             <span className="flex items-center gap-2">
//               <i className="fas fa-project-diagram"></i> Projects
//             </span>
//             <i className="fas fa-chevron-down"></i>
//           </button>

//           {activeMenu === "projects" && (
//             <ul className="ml-6 mt-2 text-sm space-y-1">
//               <li><a href="/addproject" className="hover:underline">Add Project</a></li>
//               <li><a href="/listprojects" className="hover:underline">View Projects</a></li>
//             </ul>
//           )}
//         </li>

//         <li>
//           <a href="/manage-holidays" className="flex px-3 py-2 hover:bg-[#0d5a88] rounded">
//             <i className="fas fa-calendar-alt mr-2"></i> Manage Holidays
//           </a>
//         </li>

//         <li>
//           <a href="/department-billability" className="flex px-3 py-2 hover:bg-[#0d5a88] rounded">
//             <i className="fas fa-chart-pie mr-2"></i> Onboarding Reports
//           </a>
//         </li>

//         <li>
//           <a href="/timesheet-reports" className="flex px-3 py-2 hover:bg-[#0d5a88] rounded">
//             <i className="fas fa-clock mr-2"></i> Timesheet Reports
//           </a>
//         </li>

//         <li>
//           <a href="/leave-reports-admin" className="flex px-3 py-2 hover:bg-[#0d5a88] rounded">
//             <i className="fas fa-chart-pie mr-2"></i> Leave Reports
//           </a>
//         </li>

//         <li>
//           <a href="/utilization" className="flex px-3 py-2 hover:bg-[#0d5a88] rounded">
//             <i className="fas fa-chart-line mr-2"></i> Utilization
//           </a>
//         </li>

//       </ul>
//     </aside>
//   );
// }

// src/components/Sidebar.jsx


// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FiMenu,
//   FiChevronDown,
//   FiLogOut,
//   FiClock,
//   FiUsers,
//   FiBriefcase,
//   FiLayers,
//   FiCalendar,
//   FiPieChart,
//   FiBarChart2,
//   FiChevronLeft
// } from "react-icons/fi";

// const groups = [
//   {
//     id: "employees",
//     label: "Employees",
//     icon: <FiUsers />,
//     links: [
//       { to: "/add-employee", label: "Add Employee" },
//       { to: "/employees", label: "View Employees" }
//     ]
//   },
//   {
//     id: "clients",
//     label: "Clients",
//     icon: <FiBriefcase />,
//     links: [
//       { to: "/add-client", label: "Add Client" },
//       { to: "/clients", label: "View Clients" }
//     ]
//   },
//   {
//     id: "projects",
//     label: "Projects",
//     icon: <FiLayers />,
//     links: [
//       { to: "/add-project", label: "Add Project" },
//       { to: "/projects", label: "View Projects" }
//     ]
//   }
// ];

// export default function Sidebar({ className = "" }) {
//   const [openGroup, setOpenGroup] = useState(null);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const toggleGroup = (id) => setOpenGroup(openGroup === id ? null : id);
//   const closeMobile = () => setMobileOpen(false);

//   const navLinkBase = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium";
//   const navLinkActive = "bg-white/10 text-white shadow-sm";

//   return (
//     <>
//       {/* Mobile top bar */}
//       <div className="md:hidden flex items-center justify-between bg-[#0b4970] text-white px-4 py-3">
//         <div className="flex items-center gap-3">
//           <button
//             aria-label="Toggle menu"
//             onClick={() => setMobileOpen((s) => !s)}
//             className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
//           >
//             {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
//           </button>
//           <span className="font-semibold">Admin Dashboard</span>
//         </div>
//         <button
//           className="flex items-center gap-2 text-sm px-3 py-1 bg-white/10 rounded-md hover:bg-white/20"
//           onClick={() => { /* attach logout handler if needed */ }}
//         >
//           <FiLogOut /> Logout
//         </button>
//       </div>

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 transform md:translate-x-0 transition-transform duration-200 ease-in-out
//                     ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
//                     md:static md:shadow-none bg-gradient-to-b from-[#0b4970] to-[#083a58] text-white w-64 ${className}`}
//         aria-label="Sidebar"
//       >
//         <div className="h-full flex flex-col">
//           <div className="px-5 py-6 flex items-center justify-between border-b border-white/10">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-white">
//                 <FiLayers size={18} />
//               </div>
//               <div>
//                 <div className="text-sm font-semibold">Admin Dashboard</div>
//                 <div className="text-xs text-white/70">Manage your workspace</div>
//               </div>
//             </div>

//             {/* collapse for desktop */}
//             <div className="hidden md:block">
//               <button
//                 title="Collapse menu"
//                 onClick={() => setMobileOpen((s) => !s)}
//                 className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
//                 aria-hidden
//               >
//                 <FiChevronLeft />
//               </button>
//             </div>
//           </div>

//           <nav className="px-3 py-4 overflow-auto">
//             <ul className="space-y-1">
//               {/* Direct link - Timesheet */}
//               <li>
//                 <NavLink
//                   to="/dashboard"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                 >
//                   <FiClock className="shrink-0" />
//                   <span>Fill Timesheets</span>
//                 </NavLink>
//               </li>

//               {/* group menus */}
//               {groups.map((g) => (
//                 <li key={g.id}>
//                   <button
//                     onClick={() => toggleGroup(g.id)}
//                     aria-expanded={openGroup === g.id}
//                     className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md hover:bg-white/6"
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-lg">{g.icon}</span>
//                       <span className="text-sm font-medium">{g.label}</span>
//                     </div>

//                     <div className={`transition-transform ${openGroup === g.id ? "rotate-180" : "rotate-0"}`}>
//                       <FiChevronDown />
//                     </div>
//                   </button>

//                   {openGroup === g.id && (
//                     <ul className="mt-2 ml-8 space-y-1">
//                       {g.links.map((lnk) => (
//                         <li key={lnk.to}>
//                           <NavLink
//                             to={lnk.to}
//                             className={({ isActive }) =>
//                               `block px-3 py-1 rounded-md text-sm ${isActive ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/5"}`
//                             }
//                             onClick={closeMobile}
//                           >
//                             {lnk.label}
//                           </NavLink>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}

//               {/* Utility links */}
//               <li>
//                 <NavLink
//                   to="/manage-holidays"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                 >
//                   <FiCalendar />
//                   <span>Manage Holidays</span>
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/onboarding-reports"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                 >
//                   <FiPieChart />
//                   <span>Onboarding Reports</span>
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/timesheet-reports"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                 >
//                   <FiBarChart2 />
//                   <span>Timesheet Reports</span>
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/leave-reports-admin"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                 >
//                   <FiPieChart />
//                   <span>Leave Reports</span>
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/utilization"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                 >
//                   <FiBarChart2 />
//                   <span>Utilization</span>
//                 </NavLink>
//               </li>
//             </ul>
//           </nav>

//           {/* Footer */}
//           <div className="mt-auto px-4 py-4 border-t border-white/10">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-xs text-white/80">Signed in as</div>
//                 <div className="text-sm font-medium">Admin</div>
//               </div>
//               <button
//                 onClick={() => { /* add logout call */ }}
//                 className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md hover:bg-white/20"
//                 title="Logout"
//               >
//                 <FiLogOut />
//                 <span className="text-sm">Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* overlay for mobile when open */}
//       {mobileOpen && (
//         <button
//           aria-hidden
//           onClick={() => setMobileOpen(false)}
//           className="fixed inset-0 z-30 bg-black/40 md:hidden"
//         />
//       )}
//     </>
//   );
// }


// src/components/Sidebar.jsx
// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FiMenu,
//   FiChevronLeft,
//   FiHome,
//   FiUsers,
//   FiBriefcase,
//   FiLayers,
//   FiCalendar,
//   FiPieChart,
//   FiBarChart2,
//   FiLogOut,
//   FiSettings,
//   FiChevronDown
// } from "react-icons/fi";

// /**
//  * Collapsible Sidebar
//  * - `collapsed` controls desktop compact mode (icons-only)
//  * - mobile drawer uses `mobileOpen`
//  * - hover tooltips (title) when collapsed
//  * - uses uploaded logo at local path (transformed to URL by your environment)
//  *
//  * Logo file (use as-is): /mnt/data/db990829-c0e7-40e0-a7b4-06f487d21816.png
//  */
// const groups = [
//   {
//     id: "employees",
//     label: "Employees",
//     icon: <FiUsers size={18} />,
//     links: [
//       { to: "/add-employee", label: "Add Employee" },
//       { to: "/employees", label: "View Employees" }
//     ]
//   },
//   {
//     id: "clients",
//     label: "Clients",
//     icon: <FiBriefcase size={18} />,
//     links: [
//       { to: "/add-client", label: "Add Client" },
//       { to: "/clients", label: "View Clients" }
//     ]
//   },
//   {
//     id: "projects",
//     label: "Projects",
//     icon: <FiLayers size={18} />,
//     links: [
//       { to: "/add-project", label: "Add Project" },
//       { to: "/projects", label: "View Projects" }
//     ]
//   }
// ];

// export default function Sidebar() {
//   const [openGroup, setOpenGroup] = useState(null);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   const toggleGroup = (id) => setOpenGroup(openGroup === id ? null : id);
//   const closeMobile = () => setMobileOpen(false);

//   // Local uploaded image path (will be transformed to URL by your environment)
//   const logoSrc = "/mnt/data/db990829-c0e7-40e0-a7b4-06f487d21816.png";

//   const navLinkBase = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors";
//   const navLinkActive = "bg-white/10 text-white shadow-sm";

//   return (
//     <>
//       {/* Mobile top bar */}
//       <div className="md:hidden flex items-center justify-between bg-[#0b4970] text-white px-4 py-3">
//         <div className="flex items-center gap-3">
//           <button
//             aria-label="Toggle menu"
//             onClick={() => setMobileOpen((s) => !s)}
//             className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
//           >
//             {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
//           </button>
//           <span className="font-semibold">Admin</span>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             className="flex items-center gap-2 text-sm px-3 py-1 bg-white/10 rounded-md hover:bg-white/20"
//             onClick={() => {/* logout handler */}}
//           >
//             <FiLogOut />
//             <span className="hidden sm:inline">Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-200 ease-in-out
//           ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
//           md:static md:translate-x-0
//         `}
//       >
//         <div
//           // desktop width toggles between w-64 (expanded) and w-20 (collapsed)
//           className={`h-full flex flex-col bg-gradient-to-b from-[#0b4970] to-[#083a58] text-white
//             ${collapsed ? "w-20" : "w-64"} transition-[width] duration-200 ease-in-out shadow-xl`}
//           aria-label="Sidebar"
//         >
//           {/* Header */}
//           <div className="px-3 py-4 flex items-center justify-between border-b border-white/10">
//             <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
//               <img
//                 src={logoSrc}
//                 alt="logo"
//                 className={`rounded-md object-cover ${collapsed ? "w-10 h-10" : "w-10 h-10"}`}
//                 title="App logo"
//               />
//               {!collapsed && (
//                 <div>
//                   <div className="text-sm font-semibold">Admin Dashboard</div>
//                   <div className="text-xs text-white/70">Manage your workspace</div>
//                 </div>
//               )}
//             </div>

//             {/* collapse button (desktop) */}
//             <div className="hidden md:flex items-center gap-2">
//               <button
//                 onClick={() => setCollapsed((s) => !s)}
//                 className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
//                 aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//                 title={collapsed ? "Expand" : "Collapse"}
//               >
//                 <FiChevronLeft className={`transform ${collapsed ? "rotate-180" : "rotate-0"}`} />
//               </button>
//             </div>
//           </div>

//           {/* Nav */}
//           <nav className="px-2 py-4 overflow-auto flex-1">
//             <ul className="space-y-1">
//               {/* Timesheet */}
//               <li>
//                 <NavLink
//                   to="/dashboard"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Fill Timesheets" : undefined}
//                 >
//                   <FiHome className="shrink-0 ml-1" />
//                   {!collapsed && <span>Fill Timesheets</span>}
//                 </NavLink>
//               </li>

//               {/* groups */}
//               {groups.map((g) => (
//                 <li key={g.id}>
//                   <button
//                     onClick={() => toggleGroup(g.id)}
//                     aria-expanded={openGroup === g.id}
//                     className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md hover:bg-white/6"
//                     title={collapsed ? g.label : undefined}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-lg ml-1">{g.icon}</span>
//                       {!collapsed && <span className="text-sm font-medium">{g.label}</span>}
//                     </div>

//                     {!collapsed && (
//                       <div className={`transition-transform ${openGroup === g.id ? "rotate-180" : "rotate-0"}`}>
//                         <FiChevronDown />
//                       </div>
//                     )}
//                   </button>

//                   {/* sublinks */}
//                   {openGroup === g.id && !collapsed && (
//                     <ul className="mt-1 ml-8 space-y-1">
//                       {g.links.map((lnk) => (
//                         <li key={lnk.to}>
//                           <NavLink
//                             to={lnk.to}
//                             className={({ isActive }) =>
//                               `block px-3 py-1 rounded-md text-sm ${isActive ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/5"}`
//                             }
//                             onClick={closeMobile}
//                           >
//                             {lnk.label}
//                           </NavLink>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}

//               {/* Utilities */}
//               <li>
//                 <NavLink
//                   to="/manage-holidays"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Manage Holidays" : undefined}
//                 >
//                   <FiCalendar className="shrink-0 ml-1" />
//                   {!collapsed && <span>Manage Holidays</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/onboarding-reports"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Onboarding Reports" : undefined}
//                 >
//                   <FiPieChart className="shrink-0 ml-1" />
//                   {!collapsed && <span>Onboarding Reports</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/timesheet-reports"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Timesheet Reports" : undefined}
//                 >
//                   <FiBarChart2 className="shrink-0 ml-1" />
//                   {!collapsed && <span>Timesheet Reports</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/leave-reports-admin"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Leave Reports" : undefined}
//                 >
//                   <FiPieChart className="shrink-0 ml-1" />
//                   {!collapsed && <span>Leave Reports</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/utilization"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/90 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Utilization" : undefined}
//                 >
//                   <FiBarChart2 className="shrink-0 ml-1" />
//                   {!collapsed && <span>Utilization</span>}
//                 </NavLink>
//               </li>
//             </ul>
//           </nav>

//           {/* Footer */}
//           <div className="mt-auto px-3 py-4 border-t border-white/10">
//             <div className={`flex items-center justify-between ${collapsed ? "flex-col gap-2" : ""}`}>
//               <div className={`flex items-center gap-3 ${collapsed ? "flex-col items-center" : ""}`}>
//                 <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
//                   <FiSettings />
//                 </div>
//                 {!collapsed && (
//                   <div>
//                     <div className="text-xs text-white/80">Signed in as</div>
//                     <div className="text-sm font-medium">Admin</div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={() => { /* attach logout */ }}
//                 className={`flex items-center gap-2 px-3 py-2 rounded-md ${collapsed ? "mx-auto" : ""} bg-white/10 hover:bg-white/20`}
//                 title="Logout"
//               >
//                 <FiLogOut />
//                 {!collapsed && <span className="text-sm">Logout</span>}
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* overlay for mobile when open */}
//       {mobileOpen && (
//         <button
//           aria-hidden
//           onClick={() => setMobileOpen(false)}
//           className="fixed inset-0 z-30 bg-black/40 md:hidden"
//         />
//       )}
//     </>
//   );
// }


// src/components/Sidebar.jsx
// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FiMenu,
//   FiChevronLeft,
//   FiHome,
//   FiUsers,
//   FiBriefcase,
//   FiLayers,
//   FiCalendar,
//   FiPieChart,
//   FiBarChart2,
//   FiLogOut,
//   FiSettings,
//   FiChevronDown
// } from "react-icons/fi";
// import logo from"../assets/logo.jpg";

// /**
//  * Collapsible Sidebar (updated colors to match uploaded design)
//  * - Desktop: collapsed (icons only) <-> expanded (icons + labels)
//  * - Mobile: drawer behavior
//  * - Uses the uploaded image as the small logo (local path provided)
//  *
//  * NOTE: the uploaded file will be served by your environment — the path below is
//  * the local file path we received. Your build/dev server will transform it into a URL.
//  */
// const groups = [
//   {
//     id: "employees",
//     label: "Employees",
//     icon: <FiUsers size={18} />,
//     links: [
//       { to: "/addemployee", label: "Add Employee" },
//       { to: "/employees", label: "View Employees" }
//     ]
//   },
//   {
//     id: "clients",
//     label: "Clients",
//     icon: <FiBriefcase size={18} />,
//     links: [
//       { to: "/addclient", label: "Add Client" },
//       { to: "/viewclient", label: "View Clients" }
//     ]
//   },
//   {
//     id: "projects",
//     label: "Projects",
//     icon: <FiLayers size={18} />,
//     links: [
//       { to: "/add-project", label: "Add Project" },
//       { to: "/projects", label: "View Projects" }
//     ]
//   }
// ];

// export default function Sidebar() {
//   const [openGroup, setOpenGroup] = useState(null);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   const toggleGroup = (id) => setOpenGroup(openGroup === id ? null : id);
//   const closeMobile = () => setMobileOpen(false);

//   // Use uploaded image file path (will be converted to URL by your environment)
//   const logoSrc = logo;

//   // color tokens (matching the purple/violet look from your screenshot)
//   // primary gradient: left-ish purple -> deeper purple
//   // hover/active use subtle white overlays to create soft glass effect
//   const sidebarBg = "bg-gradient-to-b from-[#6C5CE7] via-[#6A58E8] to-[#5A4FE6]";
//   const navLinkBase = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
//   const navLinkActive = "bg-white/12 text-white shadow-[0_6px_20px_rgba(90,75,255,0.12)]";

//   return (
//     <>
//       {/* Mobile top bar */}
//       <div className="md:hidden flex items-center justify-between px-4 py-3" style={{ background: "linear-gradient(90deg,#6C5CE7,#5A4FE6)" }}>
//         <div className="flex items-center gap-3">
//           <button
//             aria-label="Toggle menu"
//             onClick={() => setMobileOpen((s) => !s)}
//             className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
//           >
//             {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
//           </button>
//           <span className="font-semibold text-white">Dappr</span>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             className="flex items-center gap-2 text-sm px-3 py-1 bg-white/10 rounded-md hover:bg-white/20 text-white"
//             onClick={() => {/* logout handler */}}
//           >
//             <FiLogOut />
//             <span className="hidden sm:inline">Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-200 ease-in-out
//           ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
//           md:static md:translate-x-0`}
//       >
//         <div
//           className={`h-full flex flex-col text-white ${sidebarBg}
//             ${collapsed ? "w-20" : "w-64"} transition-[width] duration-200 ease-in-out shadow-2xl`}
//           aria-label="Sidebar"
//         >
//           {/* Header */}
//           <div className="px-3 py-4 flex items-center justify-between border-b border-white/10">
//             <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
//               <img
//                 src={logoSrc}
//                 alt="logo"
//                 className={`rounded-md object-cover ${collapsed ? "w-10 h-10" : "w-10 h-10"}`}
//                 title="App logo"
//               />
//               {!collapsed && (
//                 <div>
//                   {/* <div className="text-sm font-semibold">Dappr</div> */}
//                   <div className="text-xs text-white/80">Welcome To AdminDashboard </div>
//                 </div>
//               )}
//             </div>

//             {/* collapse button (desktop) */}
//             <div className="hidden md:flex items-center gap-2">
//               <button
//                 onClick={() => setCollapsed((s) => !s)}
//                 className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
//                 aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//                 title={collapsed ? "Expand" : "Collapse"}
//               >
//                 <FiChevronLeft className={`transform ${collapsed ? "rotate-180" : "rotate-0"}`} />
//               </button>
//             </div>
//           </div>

//           {/* Nav */}
//           <nav className="px-2 py-4 overflow-auto flex-1">
//             <ul className="space-y-1">
//               {/* Timesheet */}
//               <li>
//                 <NavLink
//                   to="/dashboard"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/95 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Fill Timesheets" : undefined}
//                 >
//                   <FiHome className="shrink-0 ml-1" />
//                   {!collapsed && <span>Dashboard</span>}
//                 </NavLink>
//               </li>

//               {/* groups */}
//               {groups.map((g) => (
//                 <li key={g.id}>
//                   <button
//                     onClick={() => toggleGroup(g.id)}
//                     aria-expanded={openGroup === g.id}
//                     className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md hover:bg-white/6"
//                     title={collapsed ? g.label : undefined}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className="text-lg ml-1">{g.icon}</span>
//                       {!collapsed && <span className="text-sm font-medium">{g.label}</span>}
//                     </div>

//                     {!collapsed && (
//                       <div className={`transition-transform ${openGroup === g.id ? "rotate-180" : "rotate-0"}`}>
//                         <FiChevronDown />
//                       </div>
//                     )}
//                   </button>

//                   {/* sublinks */}
//                   {openGroup === g.id && !collapsed && (
//                     <ul className="mt-1 ml-8 space-y-1">
//                       {g.links.map((lnk) => (
//                         <li key={lnk.to}>
//                           <NavLink
//                             to={lnk.to}
//                             className={({ isActive }) =>
//                               `block px-3 py-1 rounded-md text-sm ${isActive ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/5"}`
//                             }
//                             onClick={closeMobile}
//                           >
//                             {lnk.label}
//                           </NavLink>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}

//               {/* Utilities */}
//               <li>
//                 <NavLink
//                   to="/manage-holidays"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/95 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Manage Holidays" : undefined}
//                 >
//                   <FiCalendar className="shrink-0 ml-1" />
//                   {!collapsed && <span>Manage Holidays</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/onboarding-reports"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/95 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Onboarding Reports" : undefined}
//                 >
//                   <FiPieChart className="shrink-0 ml-1" />
//                   {!collapsed && <span>Onboarding Reports</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/timesheet-reports"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/95 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Timesheet Reports" : undefined}
//                 >
//                   <FiBarChart2 className="shrink-0 ml-1" />
//                   {!collapsed && <span>Timesheet Reports</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/leave-reports-admin"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/95 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Leave Reports" : undefined}
//                 >
//                   <FiPieChart className="shrink-0 ml-1" />
//                   {!collapsed && <span>Leave Reports</span>}
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/utilization"
//                   className={({ isActive }) =>
//                     `${navLinkBase} ${isActive ? navLinkActive : "text-white/95 hover:bg-white/6"}`
//                   }
//                   onClick={closeMobile}
//                   title={collapsed ? "Utilization" : undefined}
//                 >
//                   <FiBarChart2 className="shrink-0 ml-1" />
//                   {!collapsed && <span>Utilization</span>}
//                 </NavLink>
//               </li>
//             </ul>
//           </nav>

//           {/* Footer */}
//           <div className="mt-auto px-3 py-4 border-t border-white/10">
//             <div className={`flex items-center justify-between ${collapsed ? "flex-col gap-2" : ""}`}>
//               <div className={`flex items-center gap-3 ${collapsed ? "flex-col items-center" : ""}`}>
//                 <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
//                   <FiSettings />
//                 </div>
//                 {!collapsed && (
//                   <div>
//                     <div className="text-xs text-white/80">Signed in as</div>
//                     <div className="text-sm font-medium">Admin</div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={() => { /* attach logout */ }}
//                 className={`flex items-center gap-2 px-3 py-2 rounded-md ${collapsed ? "mx-auto" : ""} bg-white/10 hover:bg-white/20`}
//                 title="Logout"
//               >
//                 <FiLogOut />
//                 {!collapsed && <span className="text-sm">Logout</span>}
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* overlay for mobile when open */}
//       {mobileOpen && (
//         <button
//           aria-hidden
//           onClick={() => setMobileOpen(false)}
//           className="fixed inset-0 z-30 bg-black/40 md:hidden"
//         />
//       )}
//     </>
//   );
// }
// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiMenu,
  FiChevronLeft,
  FiHome,
  FiUsers,
  FiBriefcase,
  FiLayers,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiLogOut,
  FiSettings,
  FiChevronDown
} from "react-icons/fi";
import logo2 from"../assets/logo2.jpg";

// Use uploaded logo file (dev server will serve this path)
const logoSrc = logo2;

const groups = [
  {
    id: "employees",
    label: "Employees",
    icon: <FiUsers size={18} />,
    links: [
      { to: "/addemployee", label: "Add Employee" },
      { to: "/listemployee", label: "View Employees" }
    ]
  },
  {
    id: "clients",
    label: "Clients",
    icon: <FiBriefcase size={18} />,
    links: [
      { to: "/addclient", label: "Add Client" },
      { to: "/viewclient", label: "View Clients" }
    ]
  },
  {
    id: "projects",
    label: "Projects",
    icon: <FiLayers size={18} />,
    links: [
      { to: "/addproject", label: "Add Project" },
      { to: "/projectlist", label: "View Projects" }
    ]
  }
];

export default function Sidebar() {
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleGroup = (id) => setOpenGroup(openGroup === id ? null : id);
  const closeMobile = () => setMobileOpen(false);

  // Colors similar to design
  const accent = "#4C6FFF";               // main blue
  const softBlueBg = "#F3F5FF";           // light card / icon bg
  const sidebarSurface = "#FFFFFF";       // sidebar surface
  const textMain = "text-slate-800";
  const iconClass = "text-[#4C6FFF]";

  const baseItem =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150";
  const inactiveItem = "text-slate-600 hover:bg-[#f1f4ff]";
  const activeItem =
    "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm";

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="p-1 rounded-md hover:bg-slate-100 focus:outline-none"
          >
            {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
          </button>
          <span className="font-semibold text-slate-800">Admin</span>
        </div>

        <button
          className="flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
          onClick={() => { }}
        >
          <FiLogOut className="text-slate-600" />
          <span className="hidden sm:inline text-slate-700">Logout</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:static`}
      >
        <div
          className={`
            h-full flex flex-col
            ${collapsed ? "w-20" : "w-72"}
            transition-[width] duration-200 ease-in-out
            bg-[${sidebarSurface}]
            rounded-r-3xl md:rounded-r-3xl
            shadow-[0_24px_60px_rgba(15,23,42,0.12)]
            border-r border-[#e5e7f5]
          `}
          aria-label="Sidebar"
          style={{ backgroundColor: sidebarSurface }}
        >
          {/* Header */}
          <div className="px-5 py-6 flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""
                }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#f0f3ff] flex items-center justify-center shadow-sm">
                <img
                  src={logo2}
                  alt="logo"
                  className="w-8 h-8 object-cover rounded-lg"
                />
              </div>
              {!collapsed && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Welcome to
                  </div>
                  <div className="text-xs text-slate-500">Admin Dashboard</div>
                </div>
              )}
            </div>

            {/* <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCollapsed((s) => !s)}
                className="p-1 rounded-full hover:bg-[#f3f4ff] border border-[#e5e7f5]"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <FiChevronLeft
                  className={`text-slate-500 transition-transform ${collapsed ? "rotate-180" : ""
                    }`}
                  size={18}
                />
              </button>
            </div> */}
          </div>

          {/* Navigation */}
          <nav className="px-3 pb-4 pt-1 overflow-auto flex-1">
            <ul className="space-y-2">
              {/* Dashboard */}
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    [
                      baseItem,
                      isActive ? activeItem : inactiveItem
                    ].join(" ")
                  }
                  onClick={closeMobile}
                  title={collapsed ? "Dashboard" : undefined}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: softBlueBg }}
                  >
                    <FiHome className={iconClass} size={18} />
                  </div>
                  {!collapsed && (
                    <span className={`${textMain} tracking-wide`}>Dashboard</span>
                  )}
                </NavLink>
              </li>

              {/* Groups (Employees / Clients / Projects) */}
              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className={`${baseItem} w-full ${openGroup === g.id ? "bg-[#eef1ff] text-[#4C6FFF]" : inactiveItem
                      }`}
                    onClick={() => toggleGroup(g.id)}
                    title={collapsed ? g.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center rounded-2xl"
                        style={{ backgroundColor: softBlueBg }}
                      >
                        <span className={iconClass}>{g.icon}</span>
                      </div>
                      {!collapsed && (
                        <span className={`${textMain} tracking-wide`}>
                          {g.label}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <FiChevronDown
                        className={`text-slate-400 transition-transform ${openGroup === g.id ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>

                  {openGroup === g.id && !collapsed && (
                    <ul className="mt-2 ml-12 space-y-1">
                      {g.links.map((lnk) => (
                        <li key={lnk.to}>
                          <NavLink
                            to={lnk.to}
                            onClick={closeMobile}
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-lg text-xs font-medium ${isActive
                                ? "bg-[#e2e7ff] text-[#4C6FFF]"
                                : "text-slate-600 hover:bg-[#f4f5ff]"
                              }`
                            }
                          >
                            {lnk.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}

              {/* Utilities */}
              <li className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase px-5 mb-1">
                  Reports & Utilities
                </div>
              </li>

              <li>
                <NavLink
                  to="/manageholiday"
                  className={({ isActive }) =>
                    [
                      baseItem,
                      isActive ? activeItem : inactiveItem
                    ].join(" ")
                  }
                  onClick={closeMobile}
                  title={collapsed ? "Manage Holidays" : undefined}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: softBlueBg }}
                  >
                    <FiCalendar className={iconClass} size={18} />
                  </div>
                  {!collapsed && (
                    <span className={textMain}>Manage Holidays</span>
                  )}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/onboarding-reports"
                  className={({ isActive }) =>
                    [baseItem, isActive ? activeItem : inactiveItem].join(" ")
                  }
                  onClick={closeMobile}
                  title={collapsed ? "Onboarding Reports" : undefined}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: softBlueBg }}
                  >
                    <FiPieChart className={iconClass} size={18} />
                  </div>
                  {!collapsed && <span className={textMain}>Onboarding Reports</span>}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/timesheet-reports"
                  className={({ isActive }) =>
                    [
                      baseItem,
                      isActive ? activeItem : inactiveItem
                    ].join(" ")
                  }
                  onClick={closeMobile}
                  title={collapsed ? "Timesheet Reports" : undefined}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: softBlueBg }}
                  >
                    <FiBarChart2 className={iconClass} size={18} />
                  </div>
                  {!collapsed && (
                    <span className={textMain}>Timesheet Reports</span>
                  )}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/leave-reports-admin"
                  className={({ isActive }) =>
                    [
                      baseItem,
                      isActive ? activeItem : inactiveItem
                    ].join(" ")
                  }
                  onClick={closeMobile}
                  title={collapsed ? "Leave Reports" : undefined}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: softBlueBg }}
                  >
                    <FiPieChart className={iconClass} size={18} />
                  </div>
                  {!collapsed && (
                    <span className={textMain}>Leave Reports</span>
                  )}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/utilization"
                  className={({ isActive }) =>
                    [
                      baseItem,
                      isActive ? activeItem : inactiveItem
                    ].join(" ")
                  }
                  onClick={closeMobile}
                  title={collapsed ? "Utilization" : undefined}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-2xl"
                    style={{ backgroundColor: softBlueBg }}
                  >
                    <FiBarChart2 className={iconClass} size={18} />
                  </div>
                  {!collapsed && (
                    <span className={textMain}>Utilization</span>
                  )}
                </NavLink>
              </li>
            </ul>

            
          </nav>

          {/* Footer (profile + logout) */}
          <div className="mt-auto px-4 py-5 border-t border-[#e5e7f5]">
            <div
              className={`flex items-center justify-between ${collapsed ? "flex-col gap-2" : ""
                }`}
            >
              <div
                className={`flex items-center gap-3 ${collapsed ? "flex-col items-center" : ""
                  }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: softBlueBg }}
                >
                  <FiSettings className="text-slate-600" />
                </div>
                {!collapsed && (
                  <div>
                    <div className="text-[11px] text-slate-400">
                      Signed in as
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      Admin
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
                border border-[#e0e4ff] hover:bg-[#f3f5ff] ${collapsed ? "mx-auto mt-2" : ""
                  }`}
              >
                <FiLogOut className="text-slate-600" size={14} />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}
    </>
  );
}
