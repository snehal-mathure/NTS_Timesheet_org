

// import axios from "axios";

// // const API = axios.create({
// //   baseURL: "http://127.0.0.1:5000",
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// const API = axios.create({
//   baseURL: "http://127.0.0.1:5000",
// //   headers: { "Content-Type": "application/json" },
//   withCredentials: true,        // <--- required
// });


// const employeeService = {
//   // ===========================
//   // 1) FORM DATA
//   // ===========================
//   getFormData: async () => {
//     const res = await API.get(`/api/employees/form-data`);
//     return res.data;
//   },

//   // ===========================
//   // 2) ADD EMPLOYEE
//   // ===========================
//   addEmployee: async (payload) => {
//     const res = await API.post(`/admin/add_employee`, payload);
//     return res.data;
//   },

//   // ===========================
//   // 3) LIST EMPLOYEES
//   // ===========================
//   getEmployees: async (params = {}) => {
//     const clean = {};

//     Object.keys(params).forEach((key) => {
//       if (params[key] !== "" && params[key] !== undefined && params[key] !== null) {
//         clean[key] = params[key];
//       }
//     });

//     const res = await API.get(`/api/employees`, { params: clean });
//     return res.data.employees;
//   },

//   // ===========================
//   // 4) GET EXISTING (old route)
//   // ===========================
//   getEmployeeById: async (empid) => {
//     const res = await API.get(`/api/employees/${empid}`);
//     return res.data;
//   },

//   // ===========================
//   // 5) NEW — GET EMPLOYEE (Wizard)
//   // ===========================
//   getEmployee: async (empid) => {
//     const res = await API.get(`/api/employee/${empid}`);
//     return res.data;
//   },

//   // ===========================
//   // 6) NEW — UPDATE EMPLOYEE
//   // ===========================
// //   updateEmployee: async (empid, payload) => {
// //     const res = await API.put(`/api/employees/${empid}`, payload);
// //     return res.data;
// //   },
//     updateEmployee: async (empid, payload) => {
//         const res = await API.put(`/admin/editemployee/${empid}`, payload, {
//             withCredentials: true,
//         });
//         return res.data;
//     },

//   // ===========================
//   // 7) Approvers by department
//   // ===========================
//   getApproversByDepartment: async (deptId) => {
//     const res = await API.get(`/api/approvers_by_department`, {
//       params: { dept_id: deptId },
//     });
//     return res.data;
//   },

//   getDepartments: async () => {
//     const res = await API.get(`/api/departments`);
//     return res.data;
//   },

//   getAllApprovers: async () => {
//     const res = await API.get(`/api/approvers`);
//     return res.data;
//   },

//   // ===========================
//   // 8) CSV EXPORT
//   // ===========================
//   getExportCsvUrl: (params = {}) => {
//     const query = [];

//     Object.keys(params).forEach((key) => {
//       if (params[key]) {
//         query.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
//       }
//     });

//     return `http://127.0.0.1:5000/api/employees/export${
//       query.length ? "?" + query.join("&") : ""
//     }`;
//   },
// };

// export default employeeService;


import axios from "axios";
 
// const API = axios.create({
//   baseURL: "http://127.0.0.1:5000",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
 
const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
//   headers: { "Content-Type": "application/json" },
  withCredentials: true,        // <--- required
});
 
 
const employeeService = {
  // ===========================
  // 1) FORM DATA
  // ===========================
  getFormData: async () => {
    const res = await API.get(`/api/employees/form-data`);
    return res.data;
  },
 
  // ===========================
  // 2) ADD EMPLOYEE
  // ===========================
  addEmployee: async (payload) => {
    const res = await API.post(`/admin/add_employee`, payload);
    return res.data;
  },
 
  // ===========================
  // 3) LIST EMPLOYEES
  // ===========================
  getEmployees: async (params = {}) => {
    const clean = {};
 
    Object.keys(params).forEach((key) => {
      if (params[key] !== "" && params[key] !== undefined && params[key] !== null) {
        clean[key] = params[key];
      }
    });
 
    const res = await API.get(`/api/employees`, { params: clean });
    return res.data.employees;
  },
 
  // ===========================
  // 4) GET EXISTING (old route)
  // ===========================
  getEmployeeById: async (empid) => {
    const res = await API.get(`/api/employees/${empid}`);
    return res.data;
  },
 
  // ===========================
  // 5) NEW — GET EMPLOYEE (Wizard)
  // ===========================
  getEmployee: async (empid) => {
    const res = await API.get(`/api/employee/${empid}`);
    return res.data;
  },
 
  // ===========================
  // 6) NEW — UPDATE EMPLOYEE
  // ===========================
//   updateEmployee: async (empid, payload) => {
//     const res = await API.put(`/api/employees/${empid}`, payload);
//     return res.data;
//   },
    updateEmployee: async (empid, payload) => {
        const res = await API.put(`/admin/editemployee/${empid}`, payload, {
            withCredentials: true,
        });
        return res.data;
    },
 
  // ===========================
  // 7) Approvers by department
  // ===========================
  getApproversByDepartment: async (deptId) => {
    const res = await API.get(`/api/approvers_by_department`, {
      params: { dept_id: deptId },
    });
    return res.data;
  },
 
  getDepartments: async () => {
    const res = await API.get(`/api/departments`);
    return res.data;
  },
 
  getAllApprovers: async () => {
    const res = await API.get(`/api/approvers`);
    return res.data;
  },
 
  // ===========================
  // 8) CSV EXPORT
  // ===========================
  getExportCsvUrl: (params = {}) => {
    const query = [];
 
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        query.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
      }
    });
 
    return `http://127.0.0.1:5000/api/employees/export${
      query.length ? "?" + query.join("&") : ""
    }`;
  },
};
 
export default employeeService;