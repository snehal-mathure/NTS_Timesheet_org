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
 