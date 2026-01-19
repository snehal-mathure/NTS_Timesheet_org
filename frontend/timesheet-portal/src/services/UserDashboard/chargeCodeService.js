import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

const chargeCodeService = {
  getChargeCodeData: async () => {
    const empid = localStorage.getItem("empid");
    // console.log("📤 Sending empid to backend:", empid);

    const res = await api.get(`/add_project_in_timesheet/?empid=${empid}`);
    return res.data;
  },

  updateProjects: async (data) => {
    const empid = localStorage.getItem("empid");

    const res = await api.post(`/add_project_in_timesheet/?empid=${empid}`, data);
    return res.data;
  }
};

export default chargeCodeService;