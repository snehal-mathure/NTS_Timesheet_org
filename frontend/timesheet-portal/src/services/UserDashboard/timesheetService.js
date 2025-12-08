import axios from "axios";

const API = "http://127.0.0.1:5000";

const timesheetService = {
  getTimesheet: async (week_start_date) => {
    const res = await axios.get(`${API}/dashboard`, {
      params: week_start_date ? { week_start_date } : {},
      withCredentials: true,
    });
    return res.data;
  },

  saveTimesheet: async (payload) => {
    const res = await axios.post(`${API}/dashboard`, payload, {
      withCredentials: true,
    });
    return res.data;
  },
};

export default timesheetService;
 