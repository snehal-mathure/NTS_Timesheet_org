// import axios from "axios";

// // Base API configuration
// const API = axios.create({
//   baseURL: "http://127.0.0.1:5000", // Flask backend URL
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,
// });

// // ⬇⬇⬇ ADD THIS FUNCTION TO SAVE EMPID IN LOCAL STORAGE AFTER LOGIN ⬇⬇⬇

// // Login User Function
// export const loginUser = async (email, password) => {
//   try {
//     const response = await API.post(
//       "/login",
//       { email, password },
//       { withCredentials: true }  // <- THIS IS REQUIRED
//     );

//     if (response.data.message === "successful") {

//       console.log("✅ Login successful:", response.data);

//       // ***********************************************
//       // 🔥 IMPORTANT: SAVE EMPID IN LOCAL STORAGE HERE
//       // ***********************************************
//       localStorage.setItem("empid", response.data.user.empid);
//       localStorage.setItem("fname", response.data.user.fname);
//       localStorage.setItem("lname", response.data.user.lname);
//       localStorage.setItem("email", response.data.user.email);

//       return response.data;
//     } else {
//       throw new Error(response.data.message || "Invalid credentials");
//     }
//   } catch (error) {
//     if (error.response) {
//       console.error("❌ Login failed:", error.response.data);
//       throw new Error(error.response.data.message || "Server error");
//     } else {
//       console.error("⚠️ Network error:", error.message);
//       throw new Error("Unable to connect to the server");
//     }
//   }
// };

// // Register User Function
// export const registerUser = async (formData) => {
//   try {
//     const response = await API.post("/register", formData);

//     if (response.data.message === "success") {
//       console.log("✅ Registration successful:", response.data);
//       return response.data;
//     } else {
//       throw new Error(response.data.message || "Registration failed");
//     }
//   } catch (error) {
//     if (error.response) {
//       console.error("❌ Registration failed:", error.response.data);
//       throw new Error(error.response.data.message || "Server error");
//     } else {
//       console.error("⚠️ Network error:", error.message);
//       throw new Error("Unable to connect to the server");
//     }
//   }
// };


// export const getDepartments = async () => {
//   const res = await axiosInstance.get("/departments");
//   // return just the array (so components don't need to access res.data)
//   console.log(res.data)
//   return res.data;
// };

import axios from "axios";

// Base API configuration
const API = axios.create({
  baseURL: "http://127.0.0.1:5000", // Flask backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * loginUser
 * - POST /login with { email, password }
 * - On success backend should return something like:
 *   {
 *     message: "successful",
 *     user: { empid, fname, lname, email, is_admin }
 *   }
 * - Stores user details + is_admin in localStorage and returns user object
 */
export const loginUser = async (email, password) => {
  try {
    const response = await API.post(
      "/login",
      { email, password },
      { withCredentials: true }
    );

    if (response.data && response.data.message === "successful") {
      const user = response.data.user || {};

      // Save user details in localStorage
      // (stringify values to be safe — is_admin may be a number)
      localStorage.setItem("empid", user.empid || "");
      localStorage.setItem("fname", user.fname || "");
      localStorage.setItem("lname", user.lname || "");
      localStorage.setItem("email", user.email || "");
      // store as string (so Number(...) can be used when reading)
      localStorage.setItem("is_admin", String(user.is_admin ?? 0));

      console.log("✅ Login successful:", user);
      return user;
    } else {
      // backend responded but not successful
      throw new Error(response.data?.message || "Invalid credentials");
    }
  } catch (error) {
    // axios error handling
    if (error.response) {
      console.error("❌ Login failed:", error.response.data);
      throw new Error(error.response.data?.message || "Server error");
    } else {
      console.error("⚠️ Network error:", error.message);
      throw new Error("Unable to connect to the server");
    }
  }
};

/**
 * registerUser
 * - POST /register with formData
 */
export const registerUser = async (formData) => {
  try {
    const response = await API.post("/register", formData);

    if (response.data && response.data.message === "success") {
      console.log("✅ Registration successful:", response.data);
      return response.data;
    } else {
      throw new Error(response.data?.message || "Registration failed");
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Registration failed:", error.response.data);
      throw new Error(error.response.data?.message || "Server error");
    } else {
      console.error("⚠️ Network error:", error.message);
      throw new Error("Unable to connect to the server");
    }
  }
};

/**
 * getDepartments
 * - GET /departments
 * - returns res.data (array/object)
 */
export const getDepartments = async () => {
  try {
    const res = await API.get("/departments");
    console.log("departments:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to fetch departments", error);
    throw error;
  }
};
