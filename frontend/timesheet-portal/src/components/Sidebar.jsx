
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
