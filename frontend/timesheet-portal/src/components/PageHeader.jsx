import React from "react";

export default function PageHeader({
  title,
  subtitle,
  statLabel,
  statValue,
}) {
  return (
    <div
      className="mb-4 rounded-3xl border border-[#e5e7f5] px-6 py-4 flex items-center justify-between shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
      style={{
        background:
          "linear-gradient(145deg, #4C6FFF 0%, #6C5CE7 50%, #8E8CFF 100%)",
        boxShadow: "0 22px 50px rgba(76, 111, 255, 0.35)",
      }}
    >
      <div className="flex items-center gap-4">
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
          {/* smaller font than before */}
          <h1 className="text-base md:text-lg font-semibold text-white">
            {title}
          </h1>
          <p className="text-[11px] md:text-xs text-white/80 mt-0.5">
            {subtitle}
          </p>
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
