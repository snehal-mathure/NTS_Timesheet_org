
import axios from "axios";
 
// const API_URL = "http://127.0.0.1:5000";
const API_BASE = "http://127.0.0.1:5000";

 
export const addClient = async (data) => {
  try {
    const res = await axios.post(`${API_BASE}/admin/add_client`, data);
 
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : null;
  if (!res.ok) {
    const error = (payload && payload.error) || res.statusText || "API error";
    throw new Error(error);
  }
  return payload;
}

export const getClients = async (search = "") => {
  try {
    const params = search ? { search } : {};
    const res = await axios.get(`${API_BASE}/admin/view_clients`, { params });
    return { success: true, data: res.data };
  } catch (error) {
    return handleAxiosError(error);
  }
};


export async function updateClient(clientId, body) {
  const res = await fetch(`${API_BASE}/admin/update_client/${clientId}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body)
  });
  return handleResponse(res);
}

export async function deleteClient(clientId) {
  const res = await fetch(`${API_BASE}/admin/delete_client/${clientId}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "Accept": "application/json" }
  });
  return handleResponse(res);
}

// const API_BASE = "http://127.0.0.1:5000";

// async function handleResponse(res) {
//   const contentType = res.headers.get("content-type") || "";
//   const isJson = contentType.includes("application/json");
//   const payload = isJson ? await res.json() : null;
//   if (!res.ok) {
//     const error = (payload && payload.error) || res.statusText || "API error";
//     // attach payload for more debugging if needed
//     const err = new Error(error);
//     err.payload = payload;
//     throw err;
//   }
//   return payload;
// }

// export async function getClients(search = "") {
//   const q = search ? `?search=${encodeURIComponent(search)}` : "";
//   const res = await fetch(`${API_BASE}/clients${q}`, {
//     method: "GET",
//     credentials: "same-origin",
//     headers: { "Accept": "application/json" },
//   });
//   const data = await handleResponse(res);
//   return data.clients ?? data;
// }

// export async function updateClient(clientId, body) {
//   const res = await fetch(`${API_BASE}/clients/${clientId}`, {
//     method: "PUT",
//     credentials: "same-origin",
//     headers: { "Content-Type": "application/json", "Accept": "application/json" },
//     body: JSON.stringify(body),
//   });
//   return handleResponse(res);
// }

// export async function deleteClient(clientId) {
//   const res = await fetch(`${API_BASE}/clients/${clientId}`, {
//     method: "DELETE",
//     credentials: "same-origin",
//     headers: { "Accept": "application/json" },
//   });
//   return handleResponse(res);
// }