
// import axios from "axios";

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true, // keep true if you rely on Flask session cookies
// });

// const handleAxios = async (promise) => {
//   try {
//     const res = await promise;
//     return res.data ?? null;
//   } catch (err) {
//     const reqUrl = err?.config?.url || "(unknown url)";
//     const method = (err?.config?.method || "").toUpperCase();
//     const status = err?.response?.status ?? "(no status)";
//     console.error(`API Error: ${method} ${reqUrl} -> ${status}`);
//     console.error("Response data:", err?.response?.data ?? err.message);
//     // Re-throw so caller can handle errors
//     const serverMsg =
//       (err?.response?.data && (err.response.data.error || err.response.data.message)) ||
//       err.message ||
//       `Request failed (${status})`;
//     throw new Error(serverMsg);
//   }
// };

// /* ----------------------------
//    Dashboard totals
//    GET /api/dashboard/totals
//    Returns: { total_employees, total_clients, total_projects }
//    ---------------------------- */
// export async function fetchDashboardTotals() {
//   const data = await handleAxios(API.get("/api/dashboard/totals"));
//   return data ?? { total_employees: 0, total_clients: 0, total_projects: 0 };
// }

// /* ----------------------------
//    Client allocations
//    GET /api/clients/allocations
//    Returns: [{ client_name, employee_count }, ...]
//    ---------------------------- */
// export async function fetchClientAllocations() {
//   const data = await handleAxios(API.get("/api/clients/allocations"));
//   return data ?? [];
// }

// /* ----------------------------
//    Clients list
//    GET /api/clients
//    Returns: [ { clientID, client_name, ... }, ... ]
//    ---------------------------- */
// export async function fetchClients() {
//   const data = await handleAxios(API.get("/api/clients"));
//   return data ?? [];
// }

// /* ----------------------------
//    Projects list
//    GET /api/projects
//    Returns: [ { id, project_name, ... }, ... ]
//    ---------------------------- */
// export async function fetchProjects() {
//   const data = await handleAxios(API.get("/api/projects"));
//   return data ?? [];
// }

// /* ----------------------------
//    Chart counts
//    GET /api/dashboard/chart-counts
//    Expected shape:
//      {
//        client_names: [],
//        employee_counts: [],
//        department_names: [],
//        department_counts: [],
//        billable_count: 0,
//        non_billable_count: 0
//      }
//    ---------------------------- */
// export async function fetchChartCounts() {
//   const data = await handleAxios(API.get("/api/dashboard/chart-counts"));
//   return (
//     data ?? {
//       client_names: [],
//       employee_counts: [],
//       department_names: [],
//       department_counts: [],
//       billable_count: 0,
//       non_billable_count: 0,
//     }
//   );
// }

// // Optional: default export with helpers (if you import default elsewhere)
// export default {
//   fetchDashboardTotals,
//   fetchClientAllocations,
//   fetchClients,
//   fetchProjects,
//   fetchChartCounts,
// };
// src/services/AdminDashboard/admindashboard.js
// Axios-based service file for admin dashboard endpoints.
// Adjust baseURL / endpoints to match your backend.

// src/services/AdminDashboard/admindashboard.js
// 

// admindashboard.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: "/api", // if backend is http://127.0.0.1:5000/api this is correct
//   headers: { "Content-Type": "application/json" },
// });

// // helper → ensures always an array
// const safeArray = (val) => {
//   if (Array.isArray(val)) return val;
//   if (val && Array.isArray(val.data)) return val.data;
//   return [];
// };

// // ----------------------
// // Dashboard totals
// // ----------------------
// export async function fetchDashboardTotals() {
//   const res = await api.get("/admin/dashboard-totals");
//   return res.data || {};
// }

// // ----------------------
// // Client allocations
// // ----------------------
// export async function fetchClientAllocations() {
//   const res = await api.get("/admin/client-allocations");
//   return safeArray(res.data);
// }

// // ----------------------
// // Clients list
// // ----------------------
// export async function fetchClients() {
//   const res = await api.get("/admin/clients");
//   return safeArray(res.data);
// }

// // ----------------------
// // Projects list
// // ----------------------
// export async function fetchProjects() {
//   const res = await api.get("/admin/projects");
//   return safeArray(res.data);
// }

// // ----------------------
// // Chart counts
// // ----------------------
// export async function fetchChartCounts() {
//   const res = await api.get("/admin/chart-counts");
//   return res.data || {};
// }

// export default {
//   fetchDashboardTotals,
//   fetchClientAllocations,
//   fetchClients,
//   fetchProjects,
//   fetchChartCounts,
// };

// // ----------------------
// // FIX: Admin dashboard (previously used API_URL → undefined)
// // ----------------------
// export const getAdminDashboard = async () => {
//   const res = await api.get("/admin");
//   return res.data;
// };

// // ----------------------
// // FIX: CSV export
// // ----------------------
// export const exportClientAllocationsCSV = async () => {
//   const response = await api.get("/admin/export_client_allocations", {
//     responseType: "blob",
//   });

//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(response.data);
//   link.download = "client_allocations.csv";
//   link.click();
// };

import axios from "axios";
 
const API_URL = "http://127.0.0.1:5000";
 
export const getAdminDashboard = async () => {
  const res = await axios.get(`${API_URL}/admin`, {
    withCredentials: true,
  });
  return res.data;
};
 
export const exportClientAllocationsCSV = async () => {
  const response = await axios.get(`${API_URL}/admin/export_client_allocations`, {
    responseType: "blob",
    withCredentials: true,
  });
 
  const link = document.createElement("a");
  link.href = URL.createObjectURL(response.data);
  link.download = "client_allocations.csv";
  link.click();
};
 