// TimesheetReports.js
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";


// Fetch Timesheet Reports with filters
export const fetchTimesheetReports = async (params) => {
  try {
    console.log("hi in fetchtimesheet service")
    const response = await axiosInstance.get("/timesheet_reports", {
      params: params,
    });
console.log(response.data)
    return response; // return success response

  } catch (error) {
    console.error("Error fetching timesheet reports:", error);

    // return custom error object
    return {
      error: true,
      message: error.response?.data?.message || "Failed to load timesheet reports",
    };
  }
};

// Generate CSV Download URL
export const downloadCSV = (start_date, end_date, department) => {
  try {
    const s = start_date ? start_date : "";
    const e = end_date ? end_date : "";
    const d = department ? department : "";

    // return proper formatted URL
    return `http://127.0.0.1:5000/download_timesheet_report?start_date=${s}&end_date=${e}&department=${d}`;


  } catch (error) {
    console.error("Error generating CSV download URL:", error);
    return "";
  }
};