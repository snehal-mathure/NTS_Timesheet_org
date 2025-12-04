import axios from "axios";

const API_BASE = "http://localhost:5000";


// ✅ GET Client-wise Department Distribution (JSON)
export const getClientDepartmentDistribution = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await axios.get(
    `${API_BASE}/admin/client_department_distribution`,
    { params }
  );

  return response.data;
};



// ✅ EXPORT CSV - Client Department Distribution
export const exportClientDepartmentDistribution = (startDate, endDate) => {
  return axios
    .get(`${API_BASE}/export_client_department`, {
      params: {
        start_date: startDate || "",
        end_date: endDate || "",
      },
      responseType: "blob", // 🔥 required for CSV download
    })
    .then((response) => {
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Auto-detect filename from backend (optional)
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "client_department_distribution.csv";

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