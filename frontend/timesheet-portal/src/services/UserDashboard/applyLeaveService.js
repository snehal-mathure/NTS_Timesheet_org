import axios from "axios";

const API = "http://127.0.0.1:5000";

export default {
  getFormData: async () => {
    const res = await axios.get(`${API}/api/apply_leave`, {
      withCredentials: true
    });
    return res.data;
  },

  submitLeave: async (payload) => {
    const res = await axios.post(`${API}/api/apply_leave`, payload, {
      withCredentials: true
    });
    return res.data;
  }
};
 