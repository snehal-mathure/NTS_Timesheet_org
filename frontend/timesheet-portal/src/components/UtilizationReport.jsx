// import React, { useEffect, useState } from "react";
// import {
//   getUtilizationReport,
//   getFiltersList,
//   getCsvDownloadUrl,
// } from "../services/AdminDashboard/utilizationService";
 
// export default function UtilizationReport() {
//   const [filters, setFilters] = useState({
//     department: "All",
//     client: "All",
//     start_date: "",
//     end_date: "",
//   });
 
//   const [departments, setDepartments] = useState(["All"]);
//   const [clients, setClients] = useState(["All"]);
//   const [data, setData] = useState([]); // must be array
 
//   // Load dropdown options
//   const loadDropdowns = async () => {
//     try {
//       const res = await getFiltersList();
//       if (res.status === "success") {
//         setDepartments(["All", ...res.departments_list.map((d) => d.dept_name)]);
//         setClients([
//           "All",
//           ...res.clients_list.map((c) => c.client_name.split("(")[0].trim()),
//         ]);
//       }
//     } catch (err) {
//       console.error("Dropdown load error:", err);
//     }
//   };
 
//   // Fetch table data
//   const fetchData = async () => {
//     if (!filters.start_date || !filters.end_date) {
//       setData([]);
//       return;
//     }
 
//     try {
//       const res = await getUtilizationReport(filters);
//       if (res.status === "success" && Array.isArray(res.data)) {
//         setData(res.data);
//       } else {
//         setData([]);
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       setData([]);
//     }
//   };
 
//   useEffect(() => {
//     loadDropdowns();
//   }, []);
 
//   useEffect(() => {
//     fetchData();
//   }, [filters]);
 
//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };
 
//   const clearFilters = () => {
//     setFilters({
//       department: "All",
//       client: "All",
//       start_date: "",
//       end_date: "",
//     });
//     setData([]);
//   };
 
//   const downloadCSV = async () => {
//     try {
//       const res = await fetch(getCsvDownloadUrl(filters), {
//         method: "GET",
//         credentials: "include",
//       });
 
//       const result = await res.json();
//       if (!result.file) return alert("CSV unavailable");
 
//       const blob = new Blob([result.file], { type: "text/csv;charset=utf-8;" });
//       const url = window.URL.createObjectURL(blob);
 
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = result.filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       alert("Download failed");
//     }
//   };
 
//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       <h2 className="text-3xl font-semibold mb-6 text-gray-800">
//         Utilization Report
//       </h2>
 
//       {/* Filters */}
//       <div className="bg-white p-6 rounded-xl shadow-md mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="font-semibold">Department:</label>
//             <select
//               name="department"
//               value={filters.department}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//             >
//               {departments.map((d, idx) => (
//                 <option key={idx} value={d}>
//                   {d}
//                 </option>
//               ))}
//             </select>
//           </div>
 
//           <div>
//             <label className="font-semibold">Client:</label>
//             <select
//               name="client"
//               value={filters.client}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//             >
//               {clients.map((c, idx) => (
//                 <option key={idx} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>
 
//           <div>
//             <label className="font-semibold">Start Date:</label>
//             <input
//               type="date"
//               name="start_date"
//               value={filters.start_date}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//             />
//           </div>
 
//           <div>
//             <label className="font-semibold">End Date:</label>
//             <input
//               type="date"
//               name="end_date"
//               value={filters.end_date}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//             />
//           </div>
//         </div>
 
//         <button
//           onClick={clearFilters}
//           className="bg-red-600 mt-4 text-white px-6 py-2 rounded-md hover:bg-red-700"
//         >
//           Clear Filters
//         </button>
//       </div>
 
//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-xl shadow-md">
//         <table className="w-full text-sm text-center border-collapse">
//           <thead className="bg-blue-900 text-white">
//             <tr>
//               <th className="p-3">Employee Name</th>
//               <th className="p-3">Department</th>
//               <th className="p-3">Client Assigned</th>
//               <th className="p-3">Project Names</th>
//               <th className="p-3">Client Start - End</th>
//               <th className="p-3">Billed Hours</th>
//               <th className="p-3">Non-Billable Hours</th>
//               <th className="p-3">Billable Hours</th>
//               <th className="p-3">Billed Utilization %</th>
//               <th className="p-3">Non-Billable Utilization %</th>
//             </tr>
//           </thead>
 
//           <tbody>
//             {data.length > 0 ? (
//               data.map((row, idx) => (
//                 <tr key={idx} className="border">
//                   <td className="p-3">{row.employee_name}</td>
//                   <td className="p-3">{row.department}</td>
//                   <td className="p-3">{row.client_name}</td>
//                   <td className="p-3">{row.projects?.join(", ") || "-"}</td>
//                   <td className="p-3">{row.client_start_end}</td>
//                   <td className="p-3">{row.billed_hours}</td>
//                   <td className="p-3">{row.non_billable_hours}</td>
//                   <td className="p-3">{row.billable_hours}</td>
//                   <td className="p-3">{row.billed_utilization}%</td>
//                   <td className="p-3">{row.non_billable_utilization}%</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="10" className="p-4 text-gray-500">
//                   No Records Found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
 
//       <button
//         onClick={downloadCSV}
//         className="bg-green-600 text-white px-6 py-2 rounded-lg mt-6 hover:bg-green-700"
//       >
//         Download CSV
//       </button>
//     </div>
//   );
// }
 
// src/pages/UtilizationReport.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

import {
  getUtilizationReport,
  getFiltersList,
  getCsvDownloadUrl,
} from "../services/AdminDashboard/utilizationService";

const accent = "#4C6FFF";

export default function UtilizationReport() {
  const [filters, setFilters] = useState({
    department: "All",
    client: "All",
    start_date: "",
    end_date: "",
  });

  const [departments, setDepartments] = useState(["All"]);
  const [clients, setClients] = useState(["All"]);
  const [data, setData] = useState([]);

  // Load dropdown options
  const loadDropdowns = async () => {
    try {
      const res = await getFiltersList();
      if (res.status === "success") {
        setDepartments(["All", ...res.departments_list.map((d) => d.dept_name)]);
        setClients([
          "All",
          ...res.clients_list.map((c) => c.client_name.split("(")[0].trim()),
        ]);
      }
    } catch (err) {
      console.error("Dropdown load error:", err);
    }
  };

  // Fetch table data
  const fetchData = async () => {
    if (!filters.start_date || !filters.end_date) {
      setData([]);
      return;
    }
    try {
      const res = await getUtilizationReport(filters);
      if (res.status === "success" && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      department: "All",
      client: "All",
      start_date: "",
      end_date: "",
    });
    setData([]);
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(getCsvDownloadUrl(filters), {
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();
      if (!result.file) return alert("CSV unavailable");

      const blob = new Blob([result.file], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      <Sidebar />

      <main className="flex-1 px-4 md:px-10 py-6 md:py-4">
        <div className="max-w-6xl mx-auto space-y-5 mt-4">

          <PageHeader
            section="Reports"
            title="Utilization Report"
            description="View employee billable & non-billable utilization."
          />

          {/* Filters Card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Filters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div>
                <label className="font-medium text-sm text-slate-700">Department</label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
                >
                  {departments.map((d, idx) => (
                    <option key={idx} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-sm text-slate-700">Client</label>
                <select
                  name="client"
                  value={filters.client}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
                >
                  {clients.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-sm text-slate-700">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
                />
              </div>

              <div>
                <label className="font-medium text-sm text-slate-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#dce1f5] bg-[#F8F9FF] text-sm"
                />
              </div>
            </div>

            {/* Updated non-red button */}
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2 rounded-2xl font-semibold text-slate-700 shadow bg-[#E6E9F8] hover:bg-[#d8dcf7] text-sm"
            >
              Clear Filters
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">

            {/* Header Bar */}
            <div className="px-6 py-4 border-b border-[#e5e7f5] bg-white/80 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                Results ({data.length} record(s) found)
              </h3>

              {/* Download CSV on right side */}
              <button
                onClick={downloadCSV}
                className="px-5 py-2 rounded-2xl text-white font-semibold shadow hover:scale-[1.02] transition"
                style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
              >
                Download CSV
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">

                <thead className="bg-[#F3F5FF] text-slate-700">
                  <tr>
                    <th className="p-3 font-semibold text-left">Employee Name</th>
                    <th className="p-3 font-semibold text-left">Department</th>
                    <th className="p-3 font-semibold text-left">Client Assigned</th>
                    <th className="p-3 font-semibold text-left">Project Names</th>
                    <th className="p-3 font-semibold text-left">Client Start - End</th>
                    <th className="p-3 font-semibold text-left">Billed Hours</th>
                    <th className="p-3 font-semibold text-left">Non-Billable Hours</th>
                    <th className="p-3 font-semibold text-left">Billable Hours</th>
                    <th className="p-3 font-semibold text-left">Billed Utilization %</th>
                    <th className="p-3 font-semibold text-left">Non-Billable Utilization %</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length > 0 ? (
                    data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F9FF] transition border-b">
                        <td className="p-3">{row.employee_name}</td>
                        <td className="p-3">{row.department}</td>
                        <td className="p-3">{row.client_name}</td>
                        <td className="p-3">{row.projects?.join(", ") || "-"}</td>
                        <td className="p-3">{row.client_start_end}</td>
                        <td className="p-3">{row.billed_hours}</td>
                        <td className="p-3">{row.non_billable_hours}</td>
                        <td className="p-3">{row.billable_hours}</td>
                        <td className="p-3">{row.billed_utilization}%</td>
                        <td className="p-3">{row.non_billable_utilization}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="p-6 text-center text-slate-500">
                        No Records Found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
