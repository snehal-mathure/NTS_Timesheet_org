import axios from "../services/AdminDashboard/axiosInstance";



// ----------------------------
// 1️⃣ Fetch Timesheets (with filters)
// ----------------------------
export const getMyTimesheets = async (startDate = "", endDate = "") => {
  try {
    const response = await axios.get(`/dashboard/my_timesheets`, {
      params: {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      },
      withCredentials: true,
    });
    console.log(response.data.data)

    // Backend response format:
    // { status:'success', data:[...] }

    return response.data.data; 
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    throw new Error(error.response?.data?.message || "Failed to load timesheets");
  }
};

// ----------------------------
// 2️⃣ Download timesheet
// ----------------------------
export const downloadTimesheet = async (timesheetId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/download_timesheet/${timesheetId}`,
      {
        responseType: "blob",
        withCredentials: true,
      }
    );

    // Create download link
    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `timesheet_${timesheetId}.pdf`;
    link.click();

  } catch (error) {
    console.error("Error downloading timesheet:", error);
    throw new Error("Download failed");
  }
};



export const getTimesheetReviewById = async (timesheetId) => {
  try {
    const response = await axios.get(`/timesheet/review_modal/${timesheetId}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching timesheet review:", error);
    throw error;
  }
};

export const downloadTimesheetById = async (id) => {
  const res = await axios.get(`/timesheet/download/${id}`);

  if (res.data.success) {
    const { filename, filedata } = res.data;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${filedata}`;
    link.download = filename;
    link.click();
  }
};

