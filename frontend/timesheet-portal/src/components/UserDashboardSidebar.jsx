
// // src/components/UserDashboardSidebar.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import PropTypes from "prop-types";
// import { NavLink } from "react-router-dom";
// import {
//   FiMenu,
//   FiChevronLeft,
//   FiUser,
//   FiEdit,
//   FiPlusCircle,
//   FiCalendar,
//   FiCheckCircle,
//   FiUserCheck,
//   FiLogOut,
// } from "react-icons/fi";
// import logo from "../assets/logo.jpg";

// const STORAGE_KEY = "td_sidebar_collapsed";

// /**
//  * UserDashboardSidebar
//  *
//  * Props:
//  *  - overrideIsAdmin (optional) - if provided, overrides localStorage is_admin check (useful for tests)
//  */
// export default function UserDashboardSidebar({ overrideIsAdmin = null }) {
//   // read from localStorage lazily to avoid potential SSR issues
//   const [collapsed, setCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem(STORAGE_KEY) === "true";
//     } catch (e) {
//       return false;
//     }
//   });

//   const [mobileOpen, setMobileOpen] = useState(false);

//   // persist collapsed and notify same-tab listeners
//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
//       // dispatch custom event so same-tab listeners update immediately
//       window.dispatchEvent(new Event("td_sidebar_change"));
//     } catch (e) {
//       // ignore storage errors
//     }
//   }, [collapsed]);

//   // safer logout: remove keys your app uses instead of clearing everything
//   const logout = useCallback(() => {
//     try {
//       const keysToRemove = [
//         "token",
//         "empid",
//         "is_admin",
//         "fname",
//         "lname",
//         "firstName",
//         "lastName",
//       ];
//       keysToRemove.forEach((k) => localStorage.removeItem(k));
//     } catch (e) {
//       // fallback to full clear if something goes wrong
//       try {
//         localStorage.clear();
//       } catch (_) {}
//     }
//     // redirect
//     window.location.href = "/login";
//   }, []);

//   const accent = "#4C6FFF";
//   const softBlueBg = "#F3F5FF";
//   const inactiveItem = "text-slate-600 hover:bg-[#f1f4ff]";
//   const activeItem = "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm";

//   const baseItem =
//     "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150";

//   const isAdmin =
//     overrideIsAdmin !== null
//       ? Boolean(overrideIsAdmin)
//       : Number(localStorage.getItem("is_admin")) === 1 ||
//         localStorage.getItem("is_admin") === "true";

//   const empId = localStorage.getItem("empid") || "";
//   const fname = localStorage.getItem("fname") || localStorage.getItem("firstName") || "";
//   const lname = localStorage.getItem("lname") || localStorage.getItem("lastName") || "";

//   // helper to build item classes (centers icons when collapsed)
//   const navLinkClass = (isActive) =>
//     [
//       baseItem,
//       isActive ? activeItem : inactiveItem,
//       collapsed ? "justify-center px-2" : "",
//     ].join(" ");

//   // define nav items as an array so it's easier to change order or add items
//   const navItems = [
//     {
//       to: "/userdashboard",
//       label: "Dashboard",
//       Icon: FiUser,
//     },
//     {
//       to: "/dashboard/my_timesheets",
//       label: "My Timesheets",
//       Icon: FiUser,
//     },
//     {
//       to: `/editemployee/${empId}`,
//       label: "Edit Profile",
//       Icon: FiEdit,
//     },
//     {
//       to: "/addprojectintimesheet",
//       label: "Add Projects",
//       Icon: FiPlusCircle,
//     },
//     {
//       to: "/empleavedashboard",
//       label: "Leave Request",
//       Icon: FiCalendar,
//     },
//   ];

//   const adminItems = [
//     {
//       to: "/approvetimesheets",
//       label: "Approve Timesheets",
//       Icon: FiCheckCircle,
//     },
//     {
//       to: "/approveleave",
//       label: "Approve Leaves",
//       Icon: FiUserCheck,
//     },
//   ];

//   return (
//     <>
//       {/* MOBILE TOP BAR */}
//       <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setMobileOpen((s) => !s)}
//             className="p-1 rounded-md hover:bg-slate-100"
//             aria-label={mobileOpen ? "Close menu" : "Open menu"}
//             aria-expanded={mobileOpen}
//           >
//             {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
//           </button>
//           <span className="font-semibold text-slate-800">Timesheet App</span>
//         </div>

//         <button
//           onClick={logout}
//           className="flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
//         >
//           <FiLogOut className="text-slate-600" />
//           <span>Logout</span>
//         </button>
//       </div>

//       {/* SIDEBAR - fixed on desktop so it never scrolls with page */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ${
//           mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
//         }`}
//         aria-hidden={!mobileOpen && typeof window !== "undefined" ? "false" : undefined}
//       >
//         <div
//           className={`h-screen flex flex-col ${
//             collapsed ? "w-20" : "w-72"
//           } transition-all duration-200 bg-white rounded-r-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border-r border-[#e5e7f5] overflow-hidden`}
//         >
//           {/* HEADER */}
//           <div className="px-5 py-6 flex items-center justify-between">
//             <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
//               <div className="w-11 h-11 rounded-2xl bg-[#f0f3ff] flex items-center justify-center shadow-sm">
//                 <img src={logo} className="w-8 h-8 object-contain" alt="logo" />
//               </div>

//               {!collapsed && (
//                 <div>
//                   <div className="text-sm font-semibold text-slate-900">Timesheet App</div>
//                   <div className="text-xs text-slate-500">User Dashboard</div>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={() => setCollapsed((s) => !s)}
//               className="hidden md:flex p-1 rounded-full hover:bg-[#f3f4ff] border border-[#e5e7f5]"
//               aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//             >
//               <FiChevronLeft
//                 className={`text-slate-500 transition-transform ${collapsed ? "rotate-180" : ""}`}
//                 size={18}
//                 aria-hidden="true"
//               />
//             </button>
//           </div>

//           {/* NAVIGATION */}
//           <nav className="px-3 pb-4 pt-1 flex-1 overflow-hidden" aria-label="Main navigation">
//             <ul className="space-y-2">
//               {navItems.map(({ to, label, Icon }) => (
//                 <li key={to}>
//                   <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
//                     <div
//                       className="w-9 h-9 flex items-center justify-center rounded-2xl"
//                       style={{ backgroundColor: softBlueBg }}
//                       aria-hidden="true"
//                     >
//                       <Icon className="text-[#4C6FFF]" size={18} />
//                     </div>
//                     {!collapsed && <span>{label}</span>}
//                   </NavLink>
//                 </li>
//               ))}

//               {isAdmin &&
//                 adminItems.map(({ to, label, Icon }) => (
//                   <li key={to}>
//                     <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
//                       <div
//                         className="w-9 h-9 flex items-center justify-center rounded-2xl"
//                         style={{ backgroundColor: softBlueBg }}
//                         aria-hidden="true"
//                       >
//                         <Icon className="text-[#4C6FFF]" size={18} />
//                       </div>
//                       {!collapsed && <span>{label}</span>}
//                     </NavLink>
//                   </li>
//                 ))}
//             </ul>
//           </nav>

//           {/* FOOTER */}
//           <div className="mt-auto px-4 py-5 border-t border-[#e5e7f5]">
//             <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"}`}>
//               <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
//                 <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: softBlueBg }}>
//                   <FiUser className="text-[#4C6FFF]" />
//                 </div>

//                 {!collapsed && (
//                   <div>
//                     <div className="text-[11px] text-slate-400">Signed in as</div>
//                     <div className="text-sm font-semibold text-slate-800">
//                       {fname} {lname}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={logout}
//                 className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border border-[#e0e4ff] hover:bg-[#f3f5ff]"
//               >
//                 <FiLogOut className="text-slate-600" size={14} />
//                 {!collapsed && <span>Logout</span>}
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* MOBILE OVERLAY */}
//       {mobileOpen && (
//         <button
//           onClick={() => setMobileOpen(false)}
//           className="fixed inset-0 z-30 bg-black/30 md:hidden"
//           aria-label="Close sidebar"
//         />
//       )}
//     </>
//   );
// }

// UserDashboardSidebar.propTypes = {
//   overrideIsAdmin: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
// };

// src/components/UserDashboardSidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import {
  FiMenu,
  FiChevronLeft,
  FiUser,
  FiEdit,
  FiPlusCircle,
  FiCalendar,
  FiCheckCircle,
  FiUserCheck,
  FiLogOut,
} from "react-icons/fi";
import logo from "../assets/logo.jpg";

const STORAGE_KEY = "td_sidebar_collapsed";

/**
 * UserDashboardSidebar
 *
 * Props:
 *  - overrideIsAdmin (optional) - if provided, overrides localStorage is_admin check (useful for tests)
 */
export default function UserDashboardSidebar({ overrideIsAdmin = null }) {
  // read from localStorage lazily to avoid potential SSR issues
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch (e) {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // persist collapsed and notify same-tab listeners
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
      // dispatch custom event so same-tab listeners update immediately
      window.dispatchEvent(new Event("td_sidebar_change"));
    } catch (e) {
      // ignore storage errors
    }
  }, [collapsed]);

  // safer logout: remove keys your app uses instead of clearing everything
  const logout = useCallback(() => {
    try {
      const keysToRemove = [
        "token",
        "empid",
        "is_admin",
        "fname",
        "lname",
        "firstName",
        "lastName",
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // fallback to full clear if something goes wrong
      try {
        localStorage.clear();
      } catch (_) {}
    }
    // redirect
    window.location.href = "/login";
  }, []);

  const accent = "#4C6FFF";
  const softBlueBg = "#F3F5FF";
  const inactiveItem = "text-slate-600 hover:bg-[#f1f4ff]";
  const activeItem = "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm";

  const baseItem =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150";

  const isAdmin =
    overrideIsAdmin !== null
      ? Boolean(overrideIsAdmin)
      : Number(localStorage.getItem("is_admin")) === 1 ||
        localStorage.getItem("is_admin") === "true";

  const empId = localStorage.getItem("empid") || "";
  const fname = localStorage.getItem("fname") || localStorage.getItem("firstName") || "";
  const lname = localStorage.getItem("lname") || localStorage.getItem("lastName") || "";

  // helper to build item classes (centers icons when collapsed)
  const navLinkClass = (isActive) =>
    [
      baseItem,
      isActive ? activeItem : inactiveItem,
      collapsed ? "justify-center px-2" : "",
    ].join(" ");

  // define nav items as an array so it's easier to change order or add items
  const navItems = [
    {
      to: "/userdashboard",
      label: "Dashboard",
      Icon: FiUser,
    },
    {
      to: "/dashboard/my_timesheets",
      label: "My Timesheets",
      Icon: FiUser,
    },
    {
      to: `/editemployee/`,
      label: "Edit Profile",
      Icon: FiEdit,
    },
    {
      to: "/addprojectintimesheet",
      label: "Add Projects",
      Icon: FiPlusCircle,
    },
    {
      to: "/empleavedashboard",
      label: "Leave Request",
      Icon: FiCalendar,
    },
  ];

  const adminItems = [
    {
      to: "/approvetimesheets",
      label: "Approve Timesheets",
      Icon: FiCheckCircle,
    },
    {
      to: "/approveleave",
      label: "Approve Leaves",
      Icon: FiUserCheck,
    },
  ];

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="p-1 rounded-md hover:bg-slate-100"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
          </button>
          <span className="font-semibold text-slate-800">Timesheet App</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
        >
          <FiLogOut className="text-slate-600" />
          <span>Logout</span>
        </button>
      </div>

      {/* SIDEBAR - fixed on desktop so it never scrolls with page */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-hidden={!mobileOpen && typeof window !== "undefined" ? "false" : undefined}
      >
        <div
          className={`h-screen flex flex-col ${
            collapsed ? "w-20" : "w-64"
          } transition-all duration-200 bg-white rounded-r-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border-r border-[#e5e7f5] overflow-hidden`}
        >
          {/* HEADER */}
          <div className="px-4 py-4 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
              <div className="w-10 h-10 rounded-2xl bg-[#f0f3ff] flex items-center justify-center shadow-sm">
                <img src={logo} className="w-7 h-7 object-contain" alt="logo" />
              </div>

              {!collapsed && (
                <div>
                  <div className="text-sm font-semibold text-slate-900">Timesheet App</div>
                  <div className="text-xs text-slate-500">User Dashboard</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed((s) => !s)}
              className="hidden md:flex p-1 rounded-full hover:bg-[#f3f4ff] border border-[#e5e7f5]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiChevronLeft
                className={`text-slate-500 transition-transform ${collapsed ? "rotate-180" : ""}`}
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="px-2 pb-3 pt-1 flex-1 overflow-auto" aria-label="Main navigation">
            <ul className="space-y-1">
              {navItems.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-2xl"
                      style={{ backgroundColor: softBlueBg }}
                      aria-hidden="true"
                    >
                      <Icon className="text-[#4C6FFF]" size={18} />
                    </div>
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}

              {isAdmin &&
                adminItems.map(({ to, label, Icon }) => (
                  <li key={to}>
                    <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
                      <div
                        className="w-9 h-9 flex items-center justify-center rounded-2xl"
                        style={{ backgroundColor: softBlueBg }}
                        aria-hidden="true"
                      >
                        <Icon className="text-[#4C6FFF]" size={18} />
                      </div>
                      {!collapsed && <span>{label}</span>}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>

          {/* FOOTER */}
          <div className="mt-auto px-3 py-4 border-t border-[#e5e7f5]">
            <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"}`}>
              <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: softBlueBg }}>
                  <FiUser className="text-[#4C6FFF]" />
                </div>

                {!collapsed && (
                  <div>
                    <div className="text-[11px] text-slate-400">Signed in as</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {fname} {lname}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[#e0e4ff] hover:bg-[#f3f5ff]"
              >
                <FiLogOut className="text-slate-600" size={14} />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}

UserDashboardSidebar.propTypes = {
  overrideIsAdmin: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};
