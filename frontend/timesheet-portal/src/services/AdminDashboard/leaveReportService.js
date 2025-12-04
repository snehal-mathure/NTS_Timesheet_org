import axios from "axios";

const API = "http://127.0.0.1:5000";
axios.defaults.withCredentials = true;

class LeaveReportService {
  async getLeaveReports() {
    const res = await axios.get(`${API}/api/admin/leave_reports`,{withCredentials: true});
    return res.data;
  }
}

export default new LeaveReportService();




