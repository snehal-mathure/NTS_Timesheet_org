const API = "http://127.0.0.1:5000";

export default {
  async getTimesheets() {
    const res = await fetch(`${API}/timesheetdashboard/approve_timesheets`, {
      credentials: "include"
    });
    return res.json();
  },

  async singleAction(id, action, comments) {
    const res = await fetch(`${API}/timesheetdashboard/approve_timesheets`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timesheet_id: id, action, comments })
    });
    return res.json();
  },

  async bulkAction(ids, action, comments) {
    const res = await fetch(`${API}/timesheetdashboard/bulk_approve_timesheets`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timesheet_ids: ids, action, comments })
    });
    return res.json();
  },

  //  NEW: Fetch details for TimesheetDetails component
  async fetchTimesheetDetails(id) {
    const res = await fetch(`${API}/timesheet/review_modal/${id}`, {
      credentials: "include"
    });
    return res.json();
  }
};
 