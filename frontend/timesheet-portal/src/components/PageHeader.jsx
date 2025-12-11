import React from "react";

export default function PageHeader({
  title,
  subtitle,
  statLabel,
  statValue,
}) {
  return (
    <div
      className="mb-4 rounded-2xl border border-[#e5e7f5] px-5 py-3 flex items-center justify-between shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
      style={{
        background:
          "linear-gradient(145deg, #4C6FFF 0%, #6C5CE7 50%, #8E8CFF 100%)",
        boxShadow: "0 18px 40px rgba(76, 111, 255, 0.30)",
      }}
    >
      <div className="flex items-center gap-4">
        {/* Slightly larger icon box */}
        <div className="rounded-2xl bg-white/20 p-3 border border-white/30 backdrop-blur-sm">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M8 7V3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 7V3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-base md:text-lg font-semibold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/80 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {typeof statValue !== "undefined" && (
        <div className="hidden md:flex flex-col items-end gap-1 text-white/85">
          <span className="text-[10px] uppercase tracking-wide opacity-80">
            {statLabel}
          </span>
          <span className="text-xl font-semibold">{statValue}</span>
        </div>
      )}
    </div>
  );
}
