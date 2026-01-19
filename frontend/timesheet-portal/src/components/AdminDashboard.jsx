import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../services/AdminDashboard/admindashboard";
import { logoutUser } from "../services/authservice";
import Modal from "../components/Modal";
import EmployeeExcelUpload from "./EmployeeExcelUpload";

const BLUE_GRADIENT_COLORS = [
  "#7DE7EA",
  "#4EC3E0",
  "#2FA4D9",
  "#1F8DBA",
  "#1E6FA8",
  "#2C5D9E",
  "#2E3A74",
  "#1B2F5B",
];


import {
  FiMenu,
  FiLogOut,
  FiPieChart,
  FiRefreshCcw,
  FiX,
  FiUsers,       
  FiBriefcase,  
  FiLayers      
} from "react-icons/fi";

import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalClients: 0,
    totalProjects: 0,
  });

  const [clientAllocations, setClientAllocations] = useState([]);
  const [departmentAllocations, setDepartmentAllocations] = useState([]);
  const [billability, setBillability] = useState({
    billable: 0,
    nonBillable: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [loading, setLoading] = useState(false);

  // track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadOpen = () => {
    setShowUploadModal(true);
  };


  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    // update layout if sidebar toggled elsewhere (same-tab or other tabs)
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };

    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      if (data) {
        setStats(data.stats || {});
        setClientAllocations(data.clientAllocations || []);
        setDepartmentAllocations(data.departmentAllocations || []);
        setBillability(data.billability || {});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result?.success) {
      localStorage.clear();
      navigate("/"); 
    } else {
      alert("Logout failed");
    }
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "right",   // 👈 move legend to right (vertical)
        align: "center",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 11,
          },
          generateLabels: function (chart) {
            const data = chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);

            return chart.data.labels.map((label, i) => {
              const value = data[i];
              const percent = total
                ? ((value / total) * 100).toFixed(1)
                : 0;

              return {
                text: `${label}  (${percent}%)`,
                fillStyle: chart.data.datasets[0].backgroundColor[i],
                strokeStyle: chart.data.datasets[0].backgroundColor[i],
                lineWidth: 0,
                hidden: false,
              };
            });
          },
        },
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const clientPieData = {
    labels: clientAllocations.map((c) => c.client_name || "Unknown"),
    datasets: [
      {
        data: clientAllocations.map((c) => Number(c.employee_count) || 0),
        backgroundColor: BLUE_GRADIENT_COLORS,
      },
    ],
  };

  const deptPieData = {
    labels: departmentAllocations.map((d) => d.dept_name || "Unknown"),
    datasets: [
      {
        data: departmentAllocations.map((d) => Number(d.employee_count) || 0),
        backgroundColor: BLUE_GRADIENT_COLORS,
      },
    ],
  };

  const billabilityData = {
    labels: ["Billable", "Non-Billable"],
    datasets: [
      {
        data: [
          Number(billability.billable) || 0,
          Number(billability.nonBillable) || 0,
        ],
        backgroundColor: [
          "#4EC3E0", // Billable (strong blue)
          "#1F8DBA", // Non-Billable (lighter blue)
        ],
        borderWidth: 0,
        cutout: "50%",
      },
    ],
  };


  // compute main margin:
  // - sidebarCollapsed === true  -> show icon rail width (md:ml-20)
  // - sidebarCollapsed === false -> show full sidebar width (md:ml-72)
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex">
      {/* FIXED SIDEBAR (desktop) */}
      <Sidebar onUploadClick={handleUploadOpen} />

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-slate-800 text-sm">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              >
                <FiX size={14} />
              </button>
            </div>

            <div className="p-3 overflow-y-auto h-full">
              <Sidebar onUploadClick={handleUploadOpen} />
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-200 ${mainMarginClass}`}>
        {/* Top Bar Mobile */}
        <div className="lg:hidden flex justify-between items-center px-4 py-3 bg-white shadow-sm">
          <button onClick={() => setSidebarOpen(true)}>
            <FiMenu className="text-slate-600" />
          </button>
        </div>

        {/* Main */}
        <main className="px-6 pt-4 space-y-6 w-full">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] p-[1px] rounded-3xl shadow-sm">
            <div className="bg-white rounded-3xl px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <FiPieChart size={18} className="text-slate-700" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-slate-500">
                    High-level snapshot of employees, clients, projects and billability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard icon={<FiUsers />} label="Total Employees" value={stats.totalEmployees} />
            <StatCard icon={<FiBriefcase />} label="Active Clients" value={stats.totalClients} />
            <StatCard icon={<FiLayers />} label="Active Projects" value={stats.totalProjects} />
          </section>

          {/* Charts */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  Allocation & Billability
                </p>
                <p className="text-xs text-slate-500">
                  Visual overview of how employees are distributed.
                </p>
              </div>

              {/* 🔹 REFRESH WITH BOX (ONLY CHANGE YOU ASKED FOR) */}
              <button
                onClick={loadDashboard}
                className="bg-[#e8eeff] border border-[#cdd6ff] px-2 py-1 rounded-md text-[#4C6FFF] hover:bg-[#dbe4ff] transition shadow-sm"
                title="Refresh Data"
              >
                <FiRefreshCcw size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard title="Employees Per Client">
                <Pie data={clientPieData} options={chartOptions} />
              </ChartCard>

              <ChartCard title="Employees Per Department">
                <Pie data={deptPieData} options={chartOptions} />
              </ChartCard>

              <ChartCard title="Billable vs Non-Billable">
                <Doughnut data={billabilityData} options={chartOptions} />
              </ChartCard>
            </div>
          </section>
        </main>
      </div>
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      >
        <EmployeeExcelUpload />
      </Modal>

    </div>
  );
}

// Small reusable components
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-3 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex justify-center items-center">
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 shadow-sm h-[330px] flex flex-col items-center">
    <h2 className="text-xs font-semibold text-slate-700 mb-2 text-center">{title}</h2>
    <div className="flex-1 w-full flex justify-center items-center">{children}</div>
  </div>
);
