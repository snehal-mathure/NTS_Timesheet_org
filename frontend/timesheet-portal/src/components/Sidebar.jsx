// src/components/Sidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authservice";

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
  FiChevronDown,
} from "react-icons/fi";
import logo2 from "../assets/logo2.jpg";

const groups = [
  {
    id: "employees",
    label: "Employees",
    icon: <FiUsers size={14} />,
    links: [
      { to: "/addemployee", label: "Add Employee" },
      { to: "/listemployee", label: "View Employees" },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    icon: <FiBriefcase size={14} />,
    links: [
      { to: "/addclient", label: "Add Client" },
      { to: "/viewclient", label: "View Clients" },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: <FiLayers size={14} />,
    links: [
      { to: "/addproject", label: "Add Project" },
      { to: "/projectlist", label: "View Projects" },
    ],
  },
];

const STORAGE_KEY = "td_sidebar_collapsed"; // same as user sidebar
export default function Sidebar() {
  // lazy read localStorage to avoid SSR issues
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // persist & notify same-tab listeners (matches UserDashboardSidebar logic)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
      window.dispatchEvent(new Event("td_sidebar_change"));
    } catch (e) {
      // ignore storage errors
    }
  }, [collapsed]);

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
    } catch {
      try {
        localStorage.clear();
      } catch {}
    }
    window.location.href = "/login";
  }, []);

  const toggleGroup = (id) => setOpenGroup(openGroup === id ? null : id);
  const closeMobile = () => setMobileOpen(false);

  // tightened sizes (smaller font & paddings)
  const baseItem =
    "flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-medium transition-all duration-150";
  const inactiveItem = "text-slate-600 hover:bg-[#eef1ff]";
  const activeItem = "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm";
  const softBlueBg = "#F3F5FF";
  const iconClass = "text-[#4C6FFF]";

    const navigate = useNavigate();  // <-- Add this

  // ⭐ Add this function here
  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigate("/"); // redirect after successful logout
    } else {
      alert("Logout failed");
    }
  }


  return (
    <>
      {/* mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((s) => !s)}
            className="p-1 rounded-md hover:bg-slate-100"
          >
            {mobileOpen ? <FiChevronLeft size={18} /> : <FiMenu size={18} />}
          </button>
          <span className="font-semibold text-slate-800 text-[13px]">Admin</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-[11px] px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
        >
          <FiLogOut className="text-slate-600" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* desktop: fixed, h-screen so doesn't scroll with page */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        aria-hidden={!mobileOpen && typeof window !== "undefined" ? "false" : undefined}
      >
        <div
          className={`h-screen flex flex-col ${collapsed ? "w-16" : "w-56"} transition-all duration-200 bg-white rounded-r-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border-r border-[#e5e7f5] overflow-hidden`}
        >
          {/* header */}
          <div className="px-3 py-3 flex items-center justify-between">
            <div className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
              <div className="w-8 h-8 rounded-xl bg-[#f0f3ff] flex items-center justify-center">
                <img src={logo2} alt="logo" className="w-5 h-5 object-cover rounded" />
              </div>
              {!collapsed && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-900">Welcome to</div>
                  <div className="text-[9px] text-slate-500">Admin Dashboard</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed((s) => !s)}
              className="hidden md:flex p-1 rounded-full hover:bg-[#f3f4ff] border border-[#e5e7f5]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiChevronLeft className={`text-slate-500 transition-transform ${collapsed ? "rotate-180" : ""}`} size={14} />
            </button>
          </div>

          {/* nav (non-scrollable container; change to overflow-auto if you want inner scroll) */}
          <nav className="px-2 pb-3 pt-1 flex-1" aria-label="Main navigation">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    [baseItem, isActive ? activeItem : inactiveItem, collapsed ? "justify-center px-1" : ""].join(" ")
                  }
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: softBlueBg }}>
                    <FiHome className={iconClass} size={14} />
                  </div>
                  {!collapsed && <span className="text-[11px]">Dashboard</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/userdashboard"
                  className={({ isActive }) =>
                    [baseItem, isActive ? activeItem : inactiveItem, collapsed ? "justify-center px-1" : ""].join(" ")
                  }
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: softBlueBg }}>
                    <FiHome className={iconClass} size={14} />
                  </div>
                  {!collapsed && <span className="text-[11px]">Fill Timesheet</span>}
                </NavLink>
              </li>

              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className={`${baseItem} w-full ${openGroup === g.id ? activeItem : inactiveItem} ${collapsed ? "justify-center px-1" : ""}`}
                    onClick={() => toggleGroup(g.id)}
                    title={collapsed ? g.label : undefined}
                  >
                    <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: softBlueBg }}>
                      <span className={iconClass}>{g.icon}</span>
                    </div>
                    {!collapsed && <span className="text-[11px]">{g.label}</span>}
                    {!collapsed && <FiChevronDown className={`ml-auto text-slate-400 transition-transform ${openGroup === g.id ? "rotate-180" : ""}`} size={13} />}
                  </button>

                  {openGroup === g.id && !collapsed && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {g.links.map((lnk) => (
                        <li key={lnk.to}>
                          <NavLink
                            to={lnk.to}
                            onClick={closeMobile}
                            className={({ isActive }) =>
                              `block px-2 py-1 rounded-lg text-[10px] font-medium ${isActive ? "bg-[#e2e7ff] text-[#4C6FFF]" : "text-slate-600 hover:bg-[#f4f5ff]"}`
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

              {/* utilities / standalone links */}
              {[
                { to: "/manageholiday", icon: FiCalendar, label: "Manage Holidays" },
                // Onboarding Reports parent - behaves as a group with nested links & quick actions
                // when collapsed, it's a simple NavLink to the main onboarding route
                { to: "/onboarding-reports", icon: FiPieChart, label: "Onboarding Reports", isOnboarding: true },
                // { to: "/timesheet-reports", icon: FiBarChart2, label: "Timesheet Reports" },
                // { to: "/leave-reports-admin", icon: FiPieChart, label: "Leave Reports" },
                { to: "/utilization", icon: FiBarChart2, label: "Utilization" },
              ].map(({ to, icon: Icon, label, isOnboarding }) => {
                if (!isOnboarding) {
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          [baseItem, isActive ? activeItem : inactiveItem, collapsed ? "justify-center px-1" : ""].join(" ")
                        }
                      >
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: softBlueBg }}>
                          <Icon className={iconClass} size={14} />
                        </div>
                        {!collapsed && <span className="text-[11px]">{label}</span>}
                      </NavLink>
                    </li>
                  );
                }

                // onboarding group behavior
                return (
                  <li key={to}>
                    {/* when collapsed, show single NavLink icon to onboarding base route */}
                    {collapsed ? (
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          [baseItem, isActive ? activeItem : inactiveItem, "justify-center px-1"].join(" ")
                        }
                      >
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: softBlueBg }}>
                          <Icon className={iconClass} size={14} />
                        </div>
                      </NavLink>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={`${baseItem} w-full ${openGroup === "onboarding" ? activeItem : inactiveItem}`}
                          onClick={() => toggleGroup("onboarding")}
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: softBlueBg }}>
                            <Icon className={iconClass} size={14} />
                          </div>
                          <span className="text-[11px]">Reports</span>
                          <FiChevronDown className={`ml-auto text-slate-400 transition-transform ${openGroup === "onboarding" ? "rotate-180" : ""}`} size={13} />
                        </button>

                        {openGroup === "onboarding" && !collapsed && (
                          <ul className="mt-1 ml-8 space-y-1">
                            {/* main onboarding report links */}
                            <li>
                              <NavLink
                                to="/onboarding-reports/departmentBillability"
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                  `block px-2 py-1 rounded-lg text-[10px] font-medium ${isActive ? "bg-[#e2e7ff] text-[#4C6FFF]" : "text-slate-600 hover:bg-[#f4f5ff]"}`
                                }
                              >
                                Onboarding Report
                              </NavLink>
                            </li>

                            <li>
                              <NavLink
                                to="/timesheet-reports"
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                  `block px-2 py-1 rounded-lg text-[10px] font-medium ${isActive ? "bg-[#e2e7ff] text-[#4C6FFF]" : "text-slate-600 hover:bg-[#f4f5ff]"}`
                                }
                              >
                                Timesheet Reports
                              </NavLink>
                            </li>

                            <li>
                              <NavLink
                                to="/leave-reports-admin"
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                  `block px-2 py-1 rounded-lg text-[10px] font-medium ${isActive ? "bg-[#e2e7ff] text-[#4C6FFF]" : "text-slate-600 hover:bg-[#f4f5ff]"}`
                                }
                              >
                                Leave Reports
                              </NavLink>
                            </li>

                            

                          </ul>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* footer */}
          <div className="mt-auto px-2 py-3 border-t border-[#e5e7f5]">
            <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"}`}>
              <div className={`flex items-center gap-2 ${collapsed ? "flex-col items-center" : ""}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: softBlueBg }}>
                  <FiSettings className="text-slate-600" size={13} />
                </div>
                {!collapsed && (
                  <div>
                    <div className="text-[9px] text-slate-400">Signed in as</div>
                    <div className="text-[11px] font-semibold text-slate-800">Admin</div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
                  border border-[#e0e4ff] hover:bg-[#f3f5ff] ${
                    collapsed ? "mx-auto mt-2" : ""
                  }`}
              >
                <FiLogOut className="text-slate-600" size={14} />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* mobile overlay */}
      {mobileOpen && <button aria-hidden onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/30 md:hidden" />}
    </>
  );
}
