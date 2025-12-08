import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

class empLeaveDashboardService {
  
  // Fetch dashboard data (balance, leaves, holidays)
  async getDashboard() {
    const res = await axios.get(`${API_BASE}/api/emp_leave_dashboard`, {
      withCredentials: true,
    });
    return res.data;
  }

  // Cancel leave request
  async cancelLeave(leaveId) {
  const formData = new FormData();
  formData.append("leave_id", leaveId);

  try {
    const res = await axios.post(`${API_BASE}/cancel_leave`, formData, {
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to cancel leave"
    };
  }
}

}

export default new empLeaveDashboardService();