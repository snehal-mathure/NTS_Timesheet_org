import axiosInstance from "./axiosInstance";
 
// Convert dd-mm-yyyy -> yyyy-mm-dd ONLY if needed
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
 
  // If it's already yyyy-mm-dd (from <input type="date">), keep as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
 
  // If it's dd-mm-yyyy, convert to yyyy-mm-dd
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  }
 
  // Fallback: return as-is
  return dateStr;
};
 
const cleanFilters = (filters) => ({
  ...filters,
  start_date: normalizeDate(filters.start_date),
  end_date: normalizeDate(filters.end_date),
  client:
    typeof filters.client === "string" && filters.client.includes("(")
      ? filters.client.split("(")[0].trim()
      : filters.client,
});
 
// 🔹 Fetch Utilization Data (POST as form-data, so Flask can read request.form)
export const getUtilizationReport = async (filters) => {
  try {
    const cleaned = cleanFilters(filters);
 
    const formData = new FormData();
    Object.entries(cleaned).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
 
    const res = await axiosInstance.post("/admin/utilization", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
 
    return res.data;
  } catch (error) {
    console.error("Error fetching utilization report:", error);
    throw error;
  }
};
 
// Dropdown Data (GET)
export const getFiltersList = async () => {
  try {
    const res = await axiosInstance.get("/admin/utilization", {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("Error loading dropdown data:", err);
    return [];
  }
};
 
// CSV Download URL (GET)
export const getCsvDownloadUrl = (filters) => {
  const cleaned = cleanFilters(filters);
  const params = new URLSearchParams(cleaned).toString();
  return `http://127.0.0.1:5000/admin/utilization/download?${params}`;
};
 