import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("location");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/admin/reports") // <-- JSON route
      .then((res) => {
        setReport(res.data);
        setError("");
      })
      .catch((err) => {
        console.error("Report Load Error:", err);
        setError("Failed to load reports.");
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-[0_18px_40px_rgba(220,38,38,0.12)] p-6 text-center">
          <h2 className="text-lg font-semibold text-rose-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-rose-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-sm text-slate-500 bg-white/80 px-4 py-2 rounded-full shadow-sm border border-[#e5e7f5]">
          Loading reports…
        </div>
      </div>
    );
  }

  const locationData = report.location_report?.data || [];
  const empTypeData = report.employee_type_report?.data || [];
  const billabilityData = report.billability_report || {};

  // --------------------
  // 📊 Chart Config
  // --------------------

  const locationChart = {
    labels: locationData.map((d) => d.location),
    datasets: [
      {
        label: "Employees",
        data: locationData.map((d) => d.count),
        backgroundColor: ["#4C6FFF", "#22C55E", "#F97316"],
        borderRadius: 6,
      },
    ],
  };

  const empTypeChart = {
    labels: empTypeData.map((d) => d.type),
    datasets: [
      {
        label: "Employees",
        data: empTypeData.map((d) => d.count),
        backgroundColor: ["#6366F1", "#0EA5E9", "#14B8A6"],
      },
    ],
  };

  const billabilityChart = {
    labels: ["Billable", "Non-Billable"],
    datasets: [
      {
        data: [
          billabilityData.billable_count || 0,
          billabilityData.non_billable_count || 0,
        ],
        backgroundColor: ["#10B981", "#EF4444"],
      },
    ],
  };

  const tabs = [
    { id: "location", label: "Location Report" },
    { id: "empType", label: "Employee Type Report" },
    { id: "billability", label: "Billability Report" },
  ];

  return (
    <div
      className="min-h-screen w-full flex justify-center px-2 py-2"
      style={{
        background:
          "radial-gradient(circle at top left, #e0e7ff 0, #f5f7ff 40%, #ffffff 100%)",
      }}
    >
      <div className="max-w-6xl w-full">
        {/* Main card */}
        <div className="bg-white/90 rounded-3xl border border-[#e5e7f5] shadow-[0_18px_40px_rgba(15,23,42,0.12)] p-2 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Reports
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                Administrative Reports Dashboard
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Monitor employee location, type distribution and billability in
                one glance.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-between md:justify-end">
              <div className="inline-flex items-center rounded-full border border-[#e5e7f5] bg-[#f5f7ff] px-3 py-1 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Live snapshot
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full bg-[#f3f5ff] p-1 border border-[#e2e6ff]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "px-4 md:px-5 py-1.5 rounded-full text-[11px] md:text-xs font-medium transition-all",
                    "hover:translate-y-[0.5px]",
                    activeTab === tab.id
                      ? "bg-white shadow-sm text-[#4C6FFF]"
                      : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 space-y-6">
            {/* 📍 LOCATION REPORT */}
            {activeTab === "location" && (
              <section>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Employee Location Distribution
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Breakdown of employees across Onsite, Nearshore and
                      Offshore.
                    </p>
                  </div>

                  <a
                    href="http://127.0.0.1:5000/admin/location_reports?export=csv"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-medium shadow-sm hover:bg-emerald-600 transition"
                  >
                    <span className="text-[13px]">⬇</span>
                    Export CSV
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-[#e5e7f5] shadow-sm p-4">
                    <Bar
                      data={locationChart}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false } },
                          y: { grid: { color: "#EEF2FF" } },
                        },
                      }}
                    />
                  </div>

                  <div className="bg-[#f8f9ff] rounded-2xl border border-[#e5e7f5] shadow-sm p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                      Location Summary
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-[#e4e7ff] bg-white">
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-[#f3f5ff] text-slate-500">
                          <tr>
                            <th className="text-left p-2">Location</th>
                            <th className="text-right p-2">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locationData.map((item, i) => (
                            <tr
                              key={i}
                              className="border-t border-[#f1f2ff] hover:bg-[#f9f9ff]"
                            >
                              <td className="p-2 text-slate-700">
                                {item.location}
                              </td>
                              <td className="p-2 text-right text-slate-800">
                                {item.count}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-[#e6ebff] font-semibold">
                            <td className="p-2 text-slate-900">Total</td>
                            <td className="p-2 text-right text-slate-900">
                              {report.location_report.total}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 👥 EMPLOYEE TYPE REPORT */}
            {activeTab === "empType" && (
              <section>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Employee Type Distribution
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Compare contractors, full-time employees and others.
                    </p>
                  </div>

                  <a
                    href="http://127.0.0.1:5000/admin/employee_type_reports?export=csv"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-medium shadow-sm hover:bg-emerald-600 transition"
                  >
                    <span className="text-[13px]">⬇</span>
                    Export CSV
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-[#e5e7f5] shadow-sm p-4 flex items-center justify-center">
                    <Pie
                      data={empTypeChart}
                      options={{
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { boxWidth: 12, font: { size: 11 } },
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="bg-[#f8f9ff] rounded-2xl border border-[#e5e7f5] shadow-sm p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                      Employee Type Summary
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-[#e4e7ff] bg-white">
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-[#f3f5ff] text-slate-500">
                          <tr>
                            <th className="text-left p-2">Type</th>
                            <th className="text-right p-2">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empTypeData.map((t, i) => (
                            <tr
                              key={i}
                              className="border-t border-[#f1f2ff] hover:bg-[#f9f9ff]"
                            >
                              <td className="p-2 text-slate-700">{t.type}</td>
                              <td className="p-2 text-right text-slate-800">
                                {t.count}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-[#e6ebff] font-semibold">
                            <td className="p-2 text-slate-900">Total</td>
                            <td className="p-2 text-right text-slate-900">
                              {report.employee_type_report.total}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 💼 BILLABILITY REPORT */}
            {activeTab === "billability" && (
              <section>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Billability & Utilization Report
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      See how many employees are billable vs non-billable.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-[#e5e7f5] shadow-sm p-4 flex items-center justify-center">
                    <Pie
                      data={billabilityChart}
                      options={{
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { boxWidth: 12, font: { size: 11 } },
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="bg-[#f8f9ff] rounded-2xl border border-[#e5e7f5] shadow-sm p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                        Summary
                      </h3>
                      <div className="overflow-hidden rounded-xl border border-[#e4e7ff] bg-white">
                        <table className="w-full text-xs md:text-sm">
                          <tbody>
                            <tr className="border-b border-[#f1f2ff]">
                              <td className="p-2 text-slate-700">Billable</td>
                              <td className="p-2 text-right text-emerald-600 font-medium">
                                {billabilityData.billable_count}
                              </td>
                            </tr>
                            <tr className="border-b border-[#f1f2ff]">
                              <td className="p-2 text-slate-700">
                                Non-Billable
                              </td>
                              <td className="p-2 text-right text-rose-600 font-medium">
                                {billabilityData.non_billable_count}
                              </td>
                            </tr>
                            <tr className="bg-[#e6ebff] font-semibold">
                              <td className="p-2 text-slate-900">Total</td>
                              <td className="p-2 text-right text-slate-900">
                                {billabilityData.total_count}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-5 text-center">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                        Utilization Rate
                      </p>
                      <div className="text-3xl md:text-4xl font-extrabold text-[#4C6FFF] mt-1">
                        {billabilityData.utilization_percentage || 0}%
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Percentage of employees with at least one billable
                        project.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
