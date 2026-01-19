// src/components/onbording_report/OnboardingReports.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import OnboardingSidebar from "./onboarding_sidebar";

export default function OnboardingReports() {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#F5F7FF" }}
    >
      {/* Sub sidebar only */}
      <OnboardingSidebar />

      {/* Page content */}
      <main className="flex-1 px-4 md:px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
