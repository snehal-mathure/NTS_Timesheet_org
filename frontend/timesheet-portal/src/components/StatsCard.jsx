// src/components/StatsCard.jsx
import React from "react";

export default function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
