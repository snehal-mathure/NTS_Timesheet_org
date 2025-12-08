// import React, { useState } from "react";
// import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
// import { loginUser } from "../services/authservice";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       setMessage("⚠️ Please enter both email and password");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const data = await loginUser(email, password);
//       setMessage("✅ Login successful!");

//       setTimeout(() => {
//         window.location.href = "/dashboard";
//       }, 800);

//     } catch (error) {
//       setMessage(error.message || "❌ Invalid credentials");
//     }

//     setLoading(false);
//     setTimeout(() => setMessage(""), 4000);
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center 
//       bg-gradient-to-br from-[#e6edff] via-white to-[#e8e0ff] p-4"
//     >
//       <div
//         className="w-full max-w-md bg-white p-8 rounded-2xl 
//         shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-200"
//       >
//         {/* Title */}
//         <h1 className="text-3xl font-bold text-center text-black mb-6">
//           Login
//         </h1>

//         {/* Tabs */}
//         <div className="grid grid-cols-2 mb-6">
//           <button className="py-2 text-white font-semibold bg-[#2d55ff] rounded-l-lg">
//             Login
//           </button>

//           <a
//             href="/register"
//             className="py-2 text-gray-700 font-semibold bg-gray-100 
//             text-center rounded-r-lg hover:bg-gray-200"
//           >
//             Signup
//           </a>
//         </div>

//         {/* Alert */}
//         {message && (
//           <div
//             className={`mb-4 px-4 py-3 rounded-lg border shadow-sm text-sm
//             ${
//               message.includes("✅")
//                 ? "bg-green-100 border-green-300 text-green-700"
//                 : "bg-red-100 border-red-300 text-red-700"
//             }`}
//           >
//             {message}
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">

//           {/* Email Field */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Email Address *
//             </label>

//             <div
//               className="flex items-center gap-2 border border-gray-300 
//               rounded-lg px-3 py-2"
//             >
//               <FiMail className="text-gray-500 text-lg" />
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="w-full outline-none text-sm"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Password *
//             </label>

//             <div
//               className="flex items-center gap-2 border border-gray-300 
//               rounded-lg px-3 py-2"
//             >
//               <FiLock className="text-gray-500 text-lg" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 className="w-full outline-none text-sm"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               {/* Eye Button */}
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? (
//                   <FiEyeOff className="text-gray-600 text-lg" />
//                 ) : (
//                   <FiEye className="text-gray-600 text-lg" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Forgot Password */}
//           <div className="text-right">
//             <a className="text-sm text-blue-600 hover:underline cursor-pointer">
//               Forgot password?
//             </a>
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-[#4c6fff] to-[#1532c7]
//             text-white py-2 rounded-lg font-semibold shadow-md 
//             hover:opacity-95 transition disabled:bg-gray-400"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         {/* Signup Redirect */}
//         <p className="text-center text-sm text-gray-600 mt-5">
//           Don’t have an account?{" "}
//           <a href="/register" className="text-blue-600 font-medium hover:underline">
//             Signup now
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
 
import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser } from "../services/authservice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // loginUser returns the user object on success
      const user = await loginUser(email, password);

      // show success message briefly
      setMessage("✅ Login successful!");

      // Determine admin status:
      // - backend's is_admin === 1 OR
      // - special empid "N0482"
      const isAdmin = Number(user.is_admin) === 1 || user.empid === "N0482";

      // small delay so the user sees the message (same UX as before)
      setTimeout(() => {
        if (isAdmin) {
          navigate("/dashboard");
        } else {
          navigate("/userdashboard");
        }
      }, 600);
    } catch (error) {
      // error is an Error instance thrown by the service
      setMessage(error.message || "❌ Invalid credentials");
    } finally {
      setLoading(false);
      // clear message after a few seconds
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-[#e6edff] via-white to-[#e8e0ff] p-4"
    >
      <div
        className="w-full max-w-md bg-white p-8 rounded-2xl 
        shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-200"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-black mb-6">
          Login
        </h1>

        {/* Tabs */}
        <div className="grid grid-cols-2 mb-6">
          <button className="py-2 text-white font-semibold bg-[#2d55ff] rounded-l-lg">
            Login
          </button>

          <a
            href="/register"
            className="py-2 text-gray-700 font-semibold bg-gray-100 
            text-center rounded-r-lg hover:bg-gray-200"
          >
            Signup
          </a>
        </div>

        {/* Alert */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg border shadow-sm text-sm
            ${
              message.includes("✅")
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-red-100 border-red-300 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>

            <div
              className="flex items-center gap-2 border border-gray-300 
              rounded-lg px-3 py-2"
            >
              <FiMail className="text-gray-500 text-lg" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password *
            </label>

            <div
              className="flex items-center gap-2 border border-gray-300 
              rounded-lg px-3 py-2"
            >
              <FiLock className="text-gray-500 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                {showPassword ? (
                  <FiEyeOff className="text-gray-600 text-lg" />
                ) : (
                  <FiEye className="text-gray-600 text-lg" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a className="text-sm text-blue-600 hover:underline cursor-pointer">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4c6fff] to-[#1532c7]
            text-white py-2 rounded-lg font-semibold shadow-md 
            hover:opacity-95 transition disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Redirect */}
        <p className="text-center text-sm text-gray-600 mt-5">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 font-medium hover:underline">
            Signup now
          </a>
        </p>
      </div>
    </div>
  );
}
