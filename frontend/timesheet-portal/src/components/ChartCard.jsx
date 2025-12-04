// src/components/ChartCard.jsx
import React, { useRef, useEffect } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

export default function ChartCard({ title, type = "pie", data, options }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    // destroy existing instance on same canvas to avoid duplicates
    let chartInstance = Chart.getChart(ctx);
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
      },
    });

    return () => {
      chartInstance?.destroy();
    };
  }, [data, options, type]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-sky-800 mb-3 text-center">{title}</h3>
      <div className="w-full h-64">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
