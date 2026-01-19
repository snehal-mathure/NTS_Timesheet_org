// admin_manage_holidays.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch holidays list
export const getHolidays = async () => {
  try {
    const res = await API.get("/admin/manage_holidays");
    return res.data.holidays;   // your backend returns { holidays: [], count: N }
  } catch (err) {
    console.error("Error fetching holidays:", err);
    return [];
  }
};

// Add new holiday
export const addHoliday = async (form) => {
  try {
    const res = await API.post("/admin/manage_holidays", form);
    return res.data;
  } catch (err) {
    console.error("Error adding holiday:", err);
    return null;
  }
};

// Delete holiday by ID
export const deleteHoliday = async (id) => {
  try {
    const res = await API.post(`/admin/delete_holiday/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting holiday:", err);
    return null;
  }
};

