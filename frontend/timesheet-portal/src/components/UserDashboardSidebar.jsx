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
import logo2 from "../assets/logo2.jpg";

const STORAGE_KEY = "td_sidebar_collapsed";

export default function UserDashboardSidebar({ overrideIsAdmin = null }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
      window.dispatchEvent(new Event("td_sidebar_change"));
    } catch {}
  }, [collapsed]);

  const logout = useCallback(() => {
    try {
      const keysToRemove = [
        "token",
        "empid",
        "role",
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
    window.location.href = "/";
  }, []);

  const softBlueBg = "#F3F5FF";

  const baseItem =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150";
  const inactiveItem = "text-slate-600 hover:bg-[#f1f4ff]";
  const activeItem = "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm";

  const navLinkClass = (isActive) =>
    [
      baseItem,
      isActive ? activeItem : inactiveItem,
      collapsed ? "justify-center px-2" : "",
    ].join(" ");

 // ⭐ ROLE-BASED HIERARCHY (CAPABILITIES)
const role = (localStorage.getItem("role") || "employee").toLowerCase();

const isEmployee = true; // everyone is an employee

const isApprover =
  role === "approver" ||
  role === "manager" ||
  role === "admin";

const isManager =
  role === "manager" ||
  role === "admin";

const isAdmin =
  role === "admin";



  const empId =
    localStorage.getItem("empid") || "";
  const fname =
    localStorage.getItem("fname") ||
    localStorage.getItem("firstName") ||
    "";
  const lname =
    localStorage.getItem("lname") ||
    localStorage.getItem("lastName") ||
    "";

  const adminBackItem = {
    to: "/dashboard", // change route if needed
    label: "Admin Dashboard",
    Icon: FiChevronLeft,
  };

  // BASIC MENU → always shown to ALL roles
  const navItems = [
    { to: "/userdashboard", label: "Dashboard", Icon: FiUser },
    { to: "/dashboard/my_timesheets", label: "My Timesheets", Icon: FiUser },
    { to: `/edituser/${empId}`, label: "Edit Profile", Icon: FiEdit },
    { to: "/addprojectintimesheet", label: "Add Projects", Icon: FiPlusCircle },
    { to: "/empleavedashboard", label: "Leave Request", Icon: FiCalendar },
  ];

  // APPROVER + ADMIN MENU
  const approverItems = [
    {
    to: "/approver'sEmployees",
    label: "My Employees",
    Icon: FiUser, // you can change icon if you want
  },
    { to: "/approvetimesheets", label: "Approve Timesheets", Icon: FiCheckCircle },
    
  ];

  const managerItems = [
    {
    to: "/approver'sEmployees",
    label: "My Employees",
    Icon: FiUser, // you can change icon if you want
  },
    { to: "/approvetimesheets", label: "Approve Timesheets", Icon: FiCheckCircle },
    { to: "/approveleave", label: "Approve Leaves", Icon: FiUserCheck },
  ];


  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="p-1 rounded-md hover:bg-slate-100"
          >
            {mobileOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
          </button>
          <span className="font-semibold text-slate-800 text-[13px]">
            Timesheet App
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
        >
          <FiLogOut className="text-slate-600" />
          <span>Logout</span>
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div
          className={`h-screen flex flex-col ${
            collapsed ? "w-16" : "w-56"
          } bg-white rounded-r-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border-r border-[#e5e7f5]`}
        >
          {/* HEADER */}
          <div className="px-3 py-3 flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${
                collapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#f0f3ff] flex items-center justify-center">
                <img src={logo2} className="w-5 h-5 rounded" alt="logo" />
              </div>

              {!collapsed && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-900">
                    Timesheet App
                  </div>
                  <div className="text-[9px] text-slate-500">User Dashboard</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed((s) => !s)}
              className="hidden md:flex p-1 rounded-full hover:bg-[#f3f4ff] border border-[#e5e7f5]"
            >
              <FiChevronLeft
                className={`text-slate-500 transition-transform ${
                  collapsed ? "rotate-180" : ""
                }`}
                size={14}
              />
            </button>
          </div>

          {/* MAIN NAVIGATION */}
          <nav className="px-2 pb-3 pt-1 flex-1 overflow-auto">
            <ul className="space-y-1">
              {/* ADMIN ONLY → BACK TO ADMIN DASHBOARD */}
              {isAdmin && (
                <li>
                  <NavLink
                    to={adminBackItem.to}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    <div
                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: softBlueBg }}
                    >
                      <adminBackItem.Icon className="text-[#4C6FFF]" size={14} />
                    </div>
                    {!collapsed && (
                      <span className="text-[11px]">{adminBackItem.label}</span>
                    )}
                  </NavLink>
                </li>
              )}

              {/* BASIC EMPLOYEE ITEMS */}
              {navItems.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
                    <div
                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: softBlueBg }}
                    >
                      <Icon className="text-[#4C6FFF]" size={14} />
                    </div>
                    {!collapsed && <span className="text-[11px]">{label}</span>}
                  </NavLink>
                </li>
              ))}

              {/* APPROVER + ADMIN ITEMS */}
              {/* MANAGER MENU */}
{isManager &&
  managerItems.map(({ to, label, Icon }) => (
    <li key={to}>
      <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
        <div
          className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: softBlueBg }}
        >
          <Icon className="text-[#4C6FFF]" size={14} />
        </div>
        {!collapsed && <span className="text-[11px]">{label}</span>}
      </NavLink>
    </li>
  ))}

{/* APPROVER MENU (not manager) */}
{isApprover && !isManager &&
  approverItems.map(({ to, label, Icon }) => (
    <li key={to}>
      <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
        <div
          className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: softBlueBg }}
        >
          <Icon className="text-[#4C6FFF]" size={14} />
        </div>
        {!collapsed && <span className="text-[11px]">{label}</span>}
      </NavLink>
    </li>
  ))}

            </ul>
          </nav>

          {/* FOOTER */}
          <div className="mt-auto px-2 py-3 border-t border-[#e5e7f5]">
            <div
              className={`flex items-center ${
                collapsed ? "flex-col gap-2" : "justify-between"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  collapsed ? "flex-col items-center" : ""
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: softBlueBg }}
                >
                  <FiUser className="text-slate-600" size={13} />
                </div>
                {!collapsed && (
                  <div>
                    <div className="text-[9px] text-slate-400">Signed in as</div>
                    <div className="text-[11px] font-semibold text-slate-800">
                      {fname} {lname}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium border border-[#e0e4ff] hover:bg-[#f3f5ff] ${
                  collapsed ? "mx-auto mt-2" : ""
                }`}
              >
                <FiLogOut className="text-slate-600" size={13} />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}
    </>
  );
}

UserDashboardSidebar.propTypes = {
  overrideIsAdmin: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
};
