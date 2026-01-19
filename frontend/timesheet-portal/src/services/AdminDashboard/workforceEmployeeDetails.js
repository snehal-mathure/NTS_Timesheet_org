import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

/* ✅ FETCH EMPLOYEE DETAILS */
export const getWorkforceEmployeeDetails = async (params) => {
  const response = await axios.get(
    `${API_BASE}/admin/workforce_employee_details`,
    { params }
  );

  return response.data; // { total_employees, data }
};

/* ✅ EXPORT EMPLOYEE DETAILS CSV */
export const exportWorkforceEmployeeDetails = async (params) => {
  return axios.get(
    `${API_BASE}/admin/workforce_employee_details/export`,
    {
      params,
      responseType: "blob",
    }
  );
};
