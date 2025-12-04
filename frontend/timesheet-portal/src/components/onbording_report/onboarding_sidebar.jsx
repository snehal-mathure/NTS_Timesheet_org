import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
    { to: "departmentBillability", label: "Department Billability" },
    { to: "clientReports", label: "Client Reports" },
    { to: "clientDepartmentDistribution", label: "Client Dept Distribution" },
    { to: "adminReports", label: "Admin Report" },
];

export default function OnboardingSidebar() {
    const navigate = useNavigate();

    return (
        <aside className="w-64 hidden md:block">
            <div className="h-full">
                <div className="bg-white/90 rounded-3xl border border-[#e5e7f5] shadow-[0_18px_40px_rgba(15,23,42,0.12)] p-4 h-full flex flex-col">

                    {/* 🔙 Back Button */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mb-4 flex items-center gap-2 px-4 py-2 bg-[#F3F5FF] text-[#4C6FFF] rounded-2xl text-xs font-medium shadow-sm hover:bg-[#e7eaff] transition"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 6l-6 6 6 6"
                            />
                        </svg>
                        Back to Dashboard
                    </button>

                    {/* Sidebar Header */}
                    <div className="mb-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Onboarding Reports
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="space-y-2 flex-1">
                        {links.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    [
                                        "block px-4 py-2 rounded-2xl text-xs font-medium transition-all",
                                        "hover:translate-x-[1px]",
                                        isActive
                                            ? "bg-[#e4e9ff] text-[#4C6FFF] shadow-sm"
                                            : "text-slate-600 hover:bg-[#f3f5ff]",
                                    ].join(" ")
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </aside>
    );
}
