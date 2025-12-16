import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

// helper to normalize axios errors
function normalizeAxiosError(error) {
  const msg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong";
  return { success: false, message: msg, error: error?.response?.data ?? null };
}

export const getClients = async (search = "") => {
  try {
    const params = {};
    if (search) params.search = search;
    const res = await axios.get(`${API_BASE}/admin/view_clients`, { params });
    // assume backend returns { clients: [...] } or { data: {...} }
    const payload = res.data || {};
    // normalize to expected shape
    const clients = payload.clients ?? payload.data ?? payload;
    return { success: true, data: { clients } };
  } catch (error) {
    return normalizeAxiosError(error);
  }
};

export const addClient = async (data) => {
  try {
    const res = await axios.post(`${API_BASE}/admin/add_client`, data);
    return { success: true, data: res.data };
  } catch (error) {
    return normalizeAxiosError(error);
  }
};

export async function updateClient(clientId, body) {
  try {
    // use axios.put so we send JSON and get parsed json back
    const res = await axios.put(`${API_BASE}/admin/update_client/${clientId}`, body, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data };
  } catch (error) {
    return normalizeAxiosError(error);
  }
}

export async function deleteClient(clientId) {
  try {
    const res = await axios.delete(`${API_BASE}/admin/delete_client/${clientId}`);
    return { success: true, data: res.data };
  } catch (error) {
    return normalizeAxiosError(error);
  }
}
