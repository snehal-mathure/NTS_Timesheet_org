import axios from "../services/AdminDashboard/axiosInstance";

export const uploadEmployeeExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "/upload-employees",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading employee excel:", error);
    throw error;
  }
};

