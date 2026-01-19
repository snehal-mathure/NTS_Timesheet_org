import axiosInstance from "./AdminDashboard/axiosInstance";


export const getUserClients = async () => {
  try {
    const res = await axiosInstance.get("/userclients");
    
    return res.data;
  } catch (err) {
    console.error("Error loading clients:", err);
    return [];
  }
};

export const getUserProjects = async (clientID) => {
  try {
    const res = await axiosInstance.get(`/userprojects?clientID=${clientID}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
};





// SAVE TIMESHEET → POST /dashboard
export const saveTimesheet = async (weekStart, rows) => {
  const formData = new FormData();

  // Required fields for backend
  console.log(weekStart)
  formData.append("week_start_date", weekStart);
  formData.append("projects_count", rows.length);
  

  // Append each row like client_0, project_0, mon_0...
  rows.forEach((row, i) => {
    formData.append(`client_${i}`, row.client);
    formData.append(`project_${i}`, row.project);

    formData.append(`mon_${i}`, row.hours.mon || 0);
    formData.append(`tue_${i}`, row.hours.tue || 0);
    formData.append(`wed_${i}`, row.hours.wed || 0);
    formData.append(`thu_${i}`, row.hours.thu || 0);
    formData.append(`fri_${i}`, row.hours.fri || 0);
    formData.append(`sat_${i}`, row.hours.sat || 0);
    formData.append(`sun_${i}`, row.hours.sun || 0);
  });

  // Call backend
  const response = await axiosInstance.post("/dashboard", formData);
  console.log(response.data)
  return response.data; // backend sends redirect_to
};



