
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";


// Fetch Timesheet Defaulters Report
export const fetchTimesheetDefaulters = async (params) => {
  try {
    const res = await axiosInstance.get("/timesheet_defaulters", { params });
    return res;
  } catch (error) {
    console.error("Error fetching defaulters:", error);
    return { error: true };
  }
};

// Generate CSV URL
export const downloadCSVDefaulters = (start_date, end_date, department, status) => {
  return `http://127.0.0.1:5000/download_timesheet_defaulters?start_date=${start_date || ""}&end_date=${end_date || ""}&department=${department || ""}&status=${status || ""}`;
};