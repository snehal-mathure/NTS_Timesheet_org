import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/login", { email, password });

    if (response.data && response.data.message === "successful") {
      const user = response.data.user || {};

      localStorage.setItem("empid", user.empid || "");
      localStorage.setItem("fname", user.fname || "");
      localStorage.setItem("lname", user.lname || "");
      localStorage.setItem("email", user.email || "");
      localStorage.setItem("is_admin", String(user.is_admin ?? 0));

      console.log("✅ Login successful:", user);
      return user;
    } else {
      throw new Error(response.data?.message || "Invalid credentials");
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Login failed:", error.response.data);
      throw new Error(error.response.data?.message || "Server error");
    } else {
      console.error("⚠️ Network error:", error.message);
      throw new Error("Unable to connect to the server");
    }
  }
};

export const forgotPasswordRequest = async (formData) => {
  try {
    const response = await API.post("/forgot_password", formData);

    if (response.data.status === "success") {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong"
    );
  }
};


export const registerUser = async (formData) => {
  try {
    const response = await API.post("/register", formData);

    // backend success format: { "message": "success" }
    if (response.data && response.data.message === "success") {
      console.log("✅ Registration successful:", response.data);
      return response.data;
    } else {
      const backendMsg = response.data?.error || response.data?.message;
      throw new Error(backendMsg || "Registration failed");
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Registration failed:", error.response.data);

      // IMPORTANT: pick "error" field from backend and pass it forward
      const backendMsg =
        error.response.data?.error || error.response.data?.message;

      throw new Error(backendMsg || "Server error");
    } else {
      console.error("⚠️ Network error:", error.message);
      throw new Error("Unable to connect to the server");
    }
  }
};

export const getDepartments = async () => {
  try {
    const res = await API.get("/api/departments");
    console.log("departments:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to fetch departments", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await API.get("/logout", { withCredentials: true });

    if (response.data?.success) {
      // Clear local storage
      localStorage.removeItem("empid");
      localStorage.removeItem("fname");
      localStorage.removeItem("lname");
      localStorage.removeItem("email");
      localStorage.removeItem("is_admin");

      console.log("🔌 Logout successful");
      return response.data;
    } else {
      throw new Error(response.data?.message || "Logout failed");
    }
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw new Error("Unable to logout");
  }
};
