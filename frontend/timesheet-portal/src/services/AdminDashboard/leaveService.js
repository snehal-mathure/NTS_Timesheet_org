// src/services/leaveService.js
import axios from "axios";   // <-- THIS LINE IS REQUIRED

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  withCredentials: true
});

export const fetchLeaveReports = async () => {
  const res = await API.get("/admin/leave_reports");
  return res.data;
};

export default { fetchLeaveReports };
