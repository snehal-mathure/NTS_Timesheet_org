import axios from "axios";

// Base API configuration
const API = axios.create({
  baseURL: "http://127.0.0.1:5000", // Flask backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Login User Function
export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/api/login", { email, password });

    // If Flask sends "status": "success"
    if (response.data.status === "success") {
      console.log("✅ Login successful:", response.data);
      return response.data;
    } else {
      throw new Error(response.data.message || "Invalid credentials");
    }
  } catch (error) {
    // Network or API error
    if (error.response) {
      console.error("❌ Login failed:", error.response.data);
      throw new Error(error.response.data.message || "Server error");
    } else {
      console.error("⚠️ Network error:", error.message);
      throw new Error("Unable to connect to the server");
    }
  }
};

// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:5000",
//   headers: { "Content-Type": "application/json" },
// });

// export const loginUser = async (email, password) => {
//   try {
//     const response = await API.post("/api/login", { email, password });
//     return response.data;
//   } catch (error) {
//     console.error("⚠️ Network error:", error.message);
//     throw error;
//   }
// };
