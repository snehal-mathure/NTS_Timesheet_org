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
    const response = await API.post("/login", { email, password });

    // If Flask sends "status": "success"
    if (response.data.message === "successful") {
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

export const registerUser = async (formData) => {
  try {
    const response = await API.post("/register", formData);
    if (response.data.message === "success") {
      console.log("✅ Registration successful:", response.data);
      return response.data;
    } else {
      throw new Error(response.data.message || "Registration failed");
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Registration failed:", error.response.data);
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
//     const res = await API.post("/login", { email, password });
//     return res.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.message || "Login failed");
//   }
// };

// export const registerUser = async (formData) => {
//   try {
//     const res = await API.post("/register", formData);
//     return res.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.error || "Register failed");
//   }
// };
