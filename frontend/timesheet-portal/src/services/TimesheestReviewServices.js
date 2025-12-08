import axios from "./AdminDashboard/axiosInstance";

export const getReviewTimesheet = async (weekStartDate) => {
  try {
    const res = await axios.get(
      `/dashboard/timesheet_review?week_start_date=${weekStartDate}`
    );
     console.log(res.data.data)
  const data= res.data.data; // backend returns {data: [...]}
   const rows = Object.values(data.hours_by_project || {});
   console.log("Converted rows:", rows);
   return {
    rows, timesheet_id: data.timesheet_id}
    ; 


  } catch (error) {
    console.error("Error fetching review timesheet:", error);

    const message =
      (error.response &&
        error.response.data &&
        error.response.data.message) ||
      "Failed to load review timesheet.";

    throw new Error(message);
  }
};

export const submitTimesheetFinal = async (timesheet_id,weekStartDate) => {
  try {
    const payload = {
        timesheet_id: timesheet_id,
      week_start_date: weekStartDate,
    };

    const res = await axios.post("/dashboard/submit_timesheet", payload);
    return res.data;
  } catch (error) {
    console.error("Error submitting timesheet:", error);

    const message =
      (error.response &&
        error.response.data &&
        error.response.data.message) ||
      "Failed to submit timesheet.";

    throw new Error(message);
  }
};
