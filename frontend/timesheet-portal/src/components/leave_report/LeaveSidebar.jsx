// src/components/LeaveSidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft, FiFileText, FiUserCheck } from "react-icons/fi";

const STORAGE_KEY = "td_sidebar_collapsed"; // same key as OnboardingSidebar

export default function LeaveSidebar({ active = null, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  // collapse state (same logic as OnboardingSidebar)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
      window.dispatchEvent(new Event("td_sidebar_change"));
    } catch {}
  }, [collapsed]);

  // helper to decide active state:
  const isActiveRoute = (routeKey) => {
    if (active) return active === routeKey; // explicit prop wins
    // fallback to route path detection
    if (routeKey === "detailed") return location.pathname.includes("/leave-reports-admin");
    if (routeKey === "approvers") return location.pathname.includes("/leave-approvers-admin");
    return false;
  };

  const softBlueBg = "#F3F5FF";
  const iconClass = "text-[#4C6FFF]";

  // route targets — update these if your routes differ
  const ROUTES = {
    detailed: "/leave-reports-admin",
    approvers: "/leave-approvers-admin",
  };

  // render a nav item that either calls onNavigate or uses NavLink
  const NavItem = ({ id, label, Icon }) => {
    const activeClass = isActiveRoute(id)
      ? "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm"
      : "text-slate-600";

    // if an onNavigate prop exists, render a button (keeps previous behavior)
    if (typeof onNavigate === "function") {
      return (
        <button
          onClick={() => onNavigate(id)}
          className={[
            "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:bg-[#eef1ff]",
            activeClass,
            collapsed ? "justify-center px-2" : "",
          ].join(" ")}
        >
          <div
            className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: softBlueBg }}
          >
            <Icon className={iconClass} size={14} />
          </div>
          {!collapsed && <span>{label}</span>}
        </button>
      );
    }

    // otherwise use NavLink so it navigates and sets active automatically
    return (
      <NavLink
        to={ROUTES[id]}
        className={({ isActive }) =>
          [
            "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:bg-[#eef1ff]",
            isActive ? "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm" : "text-slate-600",
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
    );
  };

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
        <div className={`px-3 py-4 flex items-center justify-between ${collapsed ? "justify-center" : ""}`}>
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 text-[11px] font-medium bg-[#F3F5FF] hover:bg-[#e7eaff] rounded-xl shadow-sm transition-all px-3 py-2 ${collapsed ? "w-10 h-10 justify-center p-0" : ""}`}
          >
            <FiChevronLeft className="text-[#4C6FFF]" size={14} />
            {!collapsed && <span className="text-[11px]">Back to Dashboard</span>}
          </button>

          {/* collapse toggle */}
          {!collapsed ? (
            <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1 rounded-full border border-[#e5e7f5] hover:bg-[#f3f4ff]">
              <FiChevronLeft className="text-slate-500" size={14} />
            </button>
          ) : (
            <button onClick={() => setCollapsed(false)} className="hidden md:flex p-1 rounded-full border border-[#e5e7f5] hover:bg-[#f3f4ff]">
              <FiChevronLeft className="text-slate-500 rotate-180" size={14} />
            </button>
          )}
        </div>

        {/* Section title */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Leave Reports</p>
          </div>
        )}

        {/* NAV */}
        <nav className={`flex-1 px-2 pb-4 space-y-1 overflow-y-auto ${collapsed ? "mt-2" : ""}`}>
          <NavItem id="detailed" label="Leave Reports" Icon={FiFileText} />
          <NavItem id="approvers" label="Leave Approvers" Icon={FiUserCheck} />
        </nav>

        {/* logout / spacer if you want add at bottom else leave */}
        <div className="px-4 py-4 border-t border-slate-200">
          {/* Keep this non-breaking so logout location matches earlier design */}
          <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition">
            <span className="text-base">↪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
