// // src/services/leaveService.js
// import axios from "axios";   // <-- THIS LINE IS REQUIRED

// const API = axios.create({
//   baseURL: "http://127.0.0.1:5000",
//   withCredentials: true
// });

// export const fetchLeaveReports = async () => {
//   const res = await API.get("/admin/leave_reports");
//   return res.data;
// };

// export default { fetchLeaveReports };

import axios from "axios";

const API = "http://127.0.0.1:5000";  // Flask backend

const api = axios.create({
  baseURL: API,
  withCredentials: true, // keep session cookies (login sessions)
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------------------
   OLD SERVICES (Leave Apply + Balance)
----------------------------------------------*/

export const getLeaveBalance = async () => {
  const res = await api.get("/api/leave/balance");
  return res.data;
};

export const getRestrictedHolidays = async () => {
  const res = await api.get("/api/leave/rh");
  return res.data;
};

export const getPublicHolidays = async () => {
  const res = await api.get("/api/leave/public-holidays");
  return res.data;
};

export const submitLeaveApplication = async (payload) => {
  try {
    const res = await api.post("/api/leave/apply", payload);
    return res.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Error" };
  }
};

/* ---------------------------------------------
   NEW SERVICES (Leave Approval)
----------------------------------------------*/

// ➤ GET all leave requests for approver
export const getLeaveRequests = async () => {
  const res = await api.get("/api/leave_requests");
  return res.data;
};

// ➤ POST approve / reject leave(s)
export const approveRejectLeaves = async (payload) => {
  // payload example:
  // { leave_requests: [{ leave_req_id, empid, action }], comments: "..." }
  const res = await api.post("/api/approve_leaves", payload);
  return res.data;
};

// ➤ GET detailed leave entries for a specific request
export const getLeaveDetails = async (leaveReqId) => {
  const res = await api.get(`/api/get_leave_details/${leaveReqId}`);
  return res.data;
};

export const getApprovalHistory = async () => {
  const res = await api.get("/api/approval_history_leaves");
  return res.data; // expected { history: [...], departments: [...], employees: [...] }
};

export const cancelLeave = async (leaveId) => {
  const formData = new FormData();
  formData.append("leave_id", leaveId);

  try {
    const res = await api.post("/cancel_leave", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.error || "Failed to cancel leave",
    };
  }
};


/* ---------------------------------------------
   EXPORT ALL AS A DEFAULT OBJECT (optional)
----------------------------------------------*/

const leaveService = {
  getLeaveBalance,
  getRestrictedHolidays,
  getPublicHolidays,
  submitLeaveApplication,
  getLeaveRequests,
  approveRejectLeaves,
  getLeaveDetails,
  getApprovalHistory,
  cancelLeave,
};

export default leaveService;