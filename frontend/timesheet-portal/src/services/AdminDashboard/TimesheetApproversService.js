import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";


// Fetch Approvers Report data
export const fetchTimesheetApprovers = async (params) => {
  try {
    const response = await axiosInstance.get("/timesheet_approvers", { params });
    return response;
  } catch (error) {
    console.error("Error fetching approver data:", error);
    return {
      error: true,
      message: error.response?.data?.message || "Failed to load approvers data",
    };
  }
};

// CSV Download URL
export const downloadCSVApprovers = (department, approver) => {
  const d = department || "";
  const a = approver || "";

  return `http://127.0.0.1:5000/download_timesheet_approvers?department=${d}&approver=${a}`;
};
