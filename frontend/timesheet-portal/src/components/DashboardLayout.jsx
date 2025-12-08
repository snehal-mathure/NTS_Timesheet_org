// src/components/DashboardLayout.jsx
import React, { useEffect, useState } from "react";
import UserDashboardSidebar from "./UserDashboardSidebar";

const STORAGE_KEY = "td_sidebar_collapsed";

/**
 * DashboardLayout
 * - Default behavior: sidebar OPEN (expanded) on first visit (unless user previously collapsed it).
 * - When open => sidebar overlays content (no left margin).
 * - When collapsed => content gets md:ml-20 so icon rail is visible.
 */
export default function DashboardLayout({ children, className = "" }) {
  // Determine initial collapsed state:
  // - If not set in localStorage => default to false (expanded/open).
  // - If set => use the stored value.
  const getInitialCollapsed = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return false; // default -> OPEN
    return raw === "true";
  };

  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  // Keep in sync with events (sidebar toggles)
  useEffect(() => {
    const handler = () => {
      const isCollapsed = localStorage.getItem(STORAGE_KEY) === "true";
      setCollapsed(isCollapsed);
    };

    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  // When collapsed => main has left margin; when expanded => no margin (overlay).
  const mainMargin = collapsed ? "md:ml-20" : "md:ml-0";

  // Backdrop shows when expanded (so user can click to collapse)
  const showBackdrop = !collapsed;

  const collapseSidebar = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new Event("td_sidebar_change"));
    setCollapsed(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex">
      {/* Sidebar (fixed & handles its own collapsed state) */}
      <UserDashboardSidebar />

      {/* Backdrop shown while sidebar is expanded (overlay mode) */}
      {showBackdrop && (
        <button
          aria-label="Close sidebar"
          onClick={collapseSidebar}
          className="fixed inset-0 z-30 bg-black/20 md:block"
          // button ensures it is clickable and accessible
        />
      )}

      {/* Main content (the only scrollable area) */}
      <main
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 px-6 md:px-10 py-8 ${mainMargin} ${className}`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
