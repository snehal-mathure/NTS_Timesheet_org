import axios from "../services/AdminDashboard/axiosInstance";

export const getDashboardData = async (weekStartDate) => {
  try {
    const response = await axios.get("/dashboard", {
      params: { week_start_date: weekStartDate },
       
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
