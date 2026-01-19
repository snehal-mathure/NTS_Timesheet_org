// src/services/approvalHistoryService.js
import axios from "axios";

const API = "http://127.0.0.1:5000/timesheetdashboard/approve_timesheets";

function buildQuery(filters) {
  const params = new URLSearchParams(filters).toString();
  return params;
}

export default {
  async getInitialData() {
    const res = await axios.get(`${API}/approval_history_json`);
    return res.data;
  },

  async getFiltered(filters) {
    const res = await axios.get(
      `${API}/approval_history_json?${buildQuery(filters)}`
    );
    return res.data;
  },

  async deleteTimesheet(id) {
    return axios.post(`${API}/delete/${id}`);
  },

  getDownloadURL(filters) {
    return `${API}/download_csv?${buildQuery(filters)}`;
  }
};
 