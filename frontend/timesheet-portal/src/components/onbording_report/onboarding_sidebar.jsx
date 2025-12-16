
// // src/components/OnboardingSidebar.jsx
// import React, { useEffect, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";

// import {
//   FiLayers,
//   FiBriefcase,
//   FiPieChart,
//   FiBarChart2,
//   FiChevronLeft,
//   FiChevronDown,
// } from "react-icons/fi";

// const STORAGE_KEY = "td_sidebar_collapsed"; // SAME KEY as Sidebar.jsx

// const links = [
//   { to: "departmentBillability", label: "Department Billability", icon: FiLayers },
//   { to: "clientReports", label: "Client Reports", icon: FiBriefcase },
//   { to: "clientDepartmentDistribution", label: "Client Dept Distribution", icon: FiPieChart },
//   { to: "adminReports", label: "Admin Report", icon: FiBarChart2 },
// ];

// export default function OnboardingSidebar() {
//   const navigate = useNavigate();

//   // collapse state EXACTLY same as Sidebar.jsx
//   const [collapsed, setCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem(STORAGE_KEY) === "true";
//     } catch {
//       return false;
//     }
//   });

//   // persist collapse state
//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
//       window.dispatchEvent(new Event("td_sidebar_change"));
//     } catch {}
//   }, [collapsed]);

//   const softBlueBg = "#F3F5FF";
//   const iconClass = "text-[#4C6FFF]";

//   return (
//     <aside
//       className={`
//         fixed inset-y-0 left-0 z-40 
//         transition-all duration-200 
//         ${collapsed ? "w-16" : "w-56"}  // ← EXACT SAME WIDTH as Sidebar.jsx
//       `}
//     >
//       <div
//         className={`
//           h-full bg-white rounded-r-3xl border border-[#e5e7f5] 
//           shadow-[0_24px_60px_rgba(15,23,42,0.12)] 
//           flex flex-col overflow-hidden
//           transition-all duration-200
//         `}
//       >

//         {/* HEADER + BACK BUTTON */}
//         <div
//           className={`px-3 py-4 flex items-center justify-between ${
//             collapsed ? "justify-center" : ""
//           }`}
//         >
//           {/* Back button */}
//           <button
//             onClick={() => navigate("/dashboard")}
//             className={`
//               flex items-center gap-2 text-[11px] font-medium 
//               bg-[#F3F5FF] hover:bg-[#e7eaff] rounded-xl shadow-sm
//               transition-all px-3 py-2
//               ${collapsed ? "w-10 h-10 justify-center p-0" : ""}
//             `}
//           >
//             <FiChevronLeft className="text-[#4C6FFF]" size={14} />

//             {!collapsed && <span className="text-[11px]">Back to Dashboard</span>}
//           </button>

//           {/* Collapse toggle (same as Sidebar.jsx) */}
//           {!collapsed && (
//             <button
//               onClick={() => setCollapsed(true)}
//               className="hidden md:flex p-1 rounded-full border border-[#e5e7f5] hover:bg-[#f3f4ff]"
//             >
//               <FiChevronLeft className="text-slate-500" size={14} />
//             </button>
//           )}
//           {collapsed && (
//             <button
//               onClick={() => setCollapsed(false)}
//               className="hidden md:flex p-1 rounded-full border border-[#e5e7f5] hover:bg-[#f3f4ff]"
//             >
//               <FiChevronLeft className="text-slate-500 rotate-180" size={14} />
//             </button>
//           )}
//         </div>

//         {/* Section Title */}
//         {!collapsed && (
//           <div className="px-4 pb-2">
//             <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
//               Onboarding Reports
//             </p>
//           </div>
//         )}

//         {/* NAV LINKS */}
//         <nav
//           className={`
//             flex-1 px-2 pb-4 space-y-1 overflow-y-auto
//             ${collapsed ? "mt-2" : ""}
//           `}
//         >
//           {links.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               className={({ isActive }) =>
//                 [
//                   "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all",
//                   "hover:bg-[#eef1ff]",
//                   isActive ? "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm" : "text-slate-600",
//                   collapsed ? "justify-center px-2" : "",
//                 ].join(" ")
//               }
//             >
//               <div
//                 className="w-7 h-7 flex items-center justify-center rounded-lg"
//                 style={{ backgroundColor: softBlueBg }}
//               >
//                 <Icon className={iconClass} size={14} />
//               </div>

//               {!collapsed && <span>{label}</span>}
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     </aside>
//   );
// }
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FiLayers,
  FiBriefcase,
  FiPieChart,
  FiBarChart2,
  FiChevronLeft,
  FiUsers, // ⭐ NEW ICON
} from "react-icons/fi";

const STORAGE_KEY = "td_sidebar_collapsed"; // SAME KEY as Sidebar.jsx

// ✅ ONLY CHANGE: Added Workforce Skill Distribution link
const links = [
  { to: "departmentBillability", label: "Department Billability", icon: FiLayers },
  { to: "clientReports", label: "Client Reports", icon: FiBriefcase },
  { to: "clientDepartmentDistribution", label: "Client Dept Distribution", icon: FiPieChart },

  // ⭐ NEW PAGE (NO UI CHANGE)
  {
    to: "workforceSkillDistribution",
    label: "Workforce Skill Distribution",
    icon: FiUsers,
  },

  { to: "adminReports", label: "Admin Report", icon: FiBarChart2 },
];

export default function OnboardingSidebar() {
  const navigate = useNavigate();

  // collapse state EXACTLY same as Sidebar.jsx
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // persist collapse state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
      window.dispatchEvent(new Event("td_sidebar_change"));
    } catch {}
  }, [collapsed]);

  const softBlueBg = "#F3F5FF";
  const iconClass = "text-[#4C6FFF]";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 
        transition-all duration-200 
        ${collapsed ? "w-16" : "w-56"}
      `}
    >
      <div
        className={`
          h-full bg-white rounded-r-3xl border border-[#e5e7f5] 
          shadow-[0_24px_60px_rgba(15,23,42,0.12)] 
          flex flex-col overflow-hidden
          transition-all duration-200
        `}
      >

        {/* HEADER + BACK BUTTON */}
        <div
          className={`px-3 py-4 flex items-center justify-between ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className={`
              flex items-center gap-2 text-[11px] font-medium 
              bg-[#F3F5FF] hover:bg-[#e7eaff] rounded-xl shadow-sm
              transition-all px-3 py-2
              ${collapsed ? "w-10 h-10 justify-center p-0" : ""}
            `}
          >
            <FiChevronLeft className="text-[#4C6FFF]" size={14} />
            {!collapsed && <span className="text-[11px]">Back to Dashboard</span>}
          </button>

          {/* Collapse toggle */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex p-1 rounded-full border border-[#e5e7f5] hover:bg-[#f3f4ff]"
            >
              <FiChevronLeft className="text-slate-500" size={14} />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="hidden md:flex p-1 rounded-full border border-[#e5e7f5] hover:bg-[#f3f4ff]"
            >
              <FiChevronLeft className="text-slate-500 rotate-180" size={14} />
            </button>
          )}
        </div>

        {/* Section Title */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
              Onboarding Reports
            </p>
          </div>
        )}

        {/* NAV LINKS */}
        <nav
          className={`
            flex-1 px-2 pb-4 space-y-1 overflow-y-auto
            ${collapsed ? "mt-2" : ""}
          `}
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all",
                  "hover:bg-[#eef1ff]",
                  isActive
                    ? "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm"
                    : "text-slate-600",
                  collapsed ? "justify-center px-2" : "",
                ].join(" ")
              }
            >
              <div
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: softBlueBg }}
              >
                <Icon className={iconClass} size={14} />
              </div>

              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
