import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

class empLeaveDashboardService {

  async getDashboard() {
    const res = await axios.get(`${API_BASE}/api/emp_leave_dashboard`, {
      withCredentials: true,
    });
    return res.data;
  }

  // ✅ Cancel leave (JSON-based)
  async cancelLeave(leaveId) {
    try {
      const res = await axios.post(
        `${API_BASE}/cancel_leave`,
        { leave_id: leaveId }, // ✅ JSON payload
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to cancel leave",
      };
    }
  }
}

export default new empLeaveDashboardService();
