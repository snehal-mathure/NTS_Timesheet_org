// File: src/services/dashboardService.js

import axios from "axios";

// Axios Base Configuration
const API = axios.create({
  baseURL: "http://127.0.0.1:5000", // Flask backend
  headers: {
    "Content-Type": "application/json",
  },
});

// ----- Helper -----
const handleAxios = async (promise) => {
  try {
    const res = await promise;
    return res.data || {};
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
};

// ----------------------------
//      Dashboard Totals
// ----------------------------
export async function fetchDashboardTotals() {
  return (
    (await handleAxios(API.get("/api/dashboard/totals"))) || {
      total_employees: 0,
      total_clients: 0,
      total_projects: 0,
    }
  );
}

// ----------------------------
//   Client Employee Allocation
// ----------------------------
export async function fetchClientAllocations() {
  return (await handleAxios(API.get("/api/clients/allocations"))) || [];
}

// ----------------------------
//          Clients
// ----------------------------
export async function fetchClients() {
  return (await handleAxios(API.get("/api/clients"))) || [];
}

// ----------------------------
//          Projects
// ----------------------------
export async function fetchProjects() {
  return (await handleAxios(API.get("/api/projects"))) || [];
}

// ----------------------------
//        Chart Counts
// ----------------------------
export async function fetchChartCounts() {
  return (
    (await handleAxios(API.get("/api/dashboard/chart-counts"))) || {
      client_names: [],
      employee_counts: [],
      department_names: [],
      department_counts: [],
      billable_count: 0,
      non_billable_count: 0,
    }
  );
}
