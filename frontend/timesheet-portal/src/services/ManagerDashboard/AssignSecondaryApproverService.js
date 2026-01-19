import axios from "../AdminDashboard/axiosInstance"; // or your axios path

const approverService = {
  async getEmployeesByDept(deptId) {
  const res = await axios.get(`/employees/by_department/${deptId}`);
  return res.data;   // because backend returns a list, not an object
},


  async assignSecondaryApprover(payload) {
    // payload = { approverId, employees: [] }
    const res = await axios.post("/assign_secondary_approver", payload);
    return res.data;
  },

  async getMyEmployees(approverId) {
    return axios
      .get(`/employees/by-approver/${approverId}`)
      .then((res) => res.data);
  }
};

export default approverService;
