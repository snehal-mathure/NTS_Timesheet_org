import axios from "axios";

const API_BASE = "http://localhost:5000/";

export const getDepartmentBillability = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await axios.get(`${API_BASE}/admin/department_billability`, {
    params,
  });
  return response.data;
};


export const exportDepartmentBillability = (startDate, endDate) => {
  return axios.get(`${API_BASE}/export_department_billability`, {
      params: {
        start_date: startDate || "",
        end_date: endDate || ""
      },
      responseType: "blob",  // 🔥 REQUIRED
    })
    .then((response) => {
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Filename from backend
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "department_billability.csv";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) fileName = match[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((err) => {
      console.error("CSV Export Error:", err);
    });
};
