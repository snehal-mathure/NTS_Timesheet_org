
// // src/pages/ViewClients.jsx
// import React, { useEffect, useState, useRef } from "react";
// import { Link } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import PageHeader from "../components/PageHeader";
// import {
//   getClients,
//   updateClient,
//   deleteClient,
// } from "../services/AdminDashboard/clientservice";

// export default function ViewClients() {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingId, setEditingId] = useState(null);
//   const [formValues, setFormValues] = useState({});
//   const [search, setSearch] = useState("");
//   const [modalDeleteId, setModalDeleteId] = useState(null);
//   const [errorModalId, setErrorModalId] = useState(null);

//   // NEW: success message state
//   const [successMessage, setSuccessMessage] = useState("");
//   const successTimerRef = useRef(null);

//   const accent = "#4C6FFF"; // dashboard blue

//   useEffect(() => {
//     loadClients();
//     return () => {
//       // cleanup any pending timer
//       if (successTimerRef.current) clearTimeout(successTimerRef.current);
//     };
//   }, []);

//   async function loadClients(q = "") {
//     setLoading(true);
//     try {
//       const resp = await getClients(q);
//       setClients(resp.success ? resp.data?.clients ?? [] : []);
//     } catch {
//       setClients([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function onStartEdit(client) {
//     setEditingId(client.clientID);
//     setFormValues({
//       client_name: client.client_name || "",
//       start_date: client.start_date?.slice(0, 10) || "",
//       end_date: client.end_date?.slice(0, 10) || "",
//       daily_hours: client.daily_hours ?? "",
//     });
//   }

//   function onCancelEdit() {
//     setEditingId(null);
//     setFormValues({});
//   }

//   // show success helper (auto dismiss)
//   const showSuccess = (msg) => {
//     setSuccessMessage(msg);
//     if (successTimerRef.current) clearTimeout(successTimerRef.current);
//     successTimerRef.current = setTimeout(() => setSuccessMessage(""), 3000);
//   };

//   async function onSave(clientId) {
//     try {
//       const payload = {
//         client_name: formValues.client_name,
//         start_date: formValues.start_date || null,
//         end_date: formValues.end_date || null,
//         daily_hours:
//           formValues.daily_hours === "" ? null : Number(formValues.daily_hours),
//       };

//       const res = await updateClient(clientId, payload);
//       if (res.success) {
//         setClients((prev) =>
//           prev.map((c) => (c.clientID === clientId ? { ...c, ...payload } : c))
//         );
//         onCancelEdit();

//         // NEW: show success message (prefer server message if present)
//         const msg =
//           (res.data && (res.data.message || res.data.msg)) ||
//           res.message ||
//           "Client updated successfully";
//         showSuccess(msg);
//       } else {
//         alert(res.message || "Update failed");
//       }
//     } catch (err) {
//       alert(err.message || "Error updating");
//     }
//   }

//   async function onDeleteConfirmed(clientId) {
//     try {
//       const res = await deleteClient(clientId);
//       if (res.success) {
//         setClients((prev) => prev.filter((c) => c.clientID !== clientId));
//       } else {
//         setErrorModalId(clientId);
//       }
//     } finally {
//       setModalDeleteId(null);
//     }
//   }

//   const onSearchSubmit = (e) => {
//     e.preventDefault();
//     loadClients(search.trim());
//   };

//   return (
//     <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
//       <Sidebar />

//       <main className="flex-1 px-4 md:px-10 py-6 md:py-2">
//         <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">
//           {/* Shared Page Header */}
//           <PageHeader
//             section="Clients"
//             title="Manage Clients"
//             description="View, search, edit or remove clients."
//           />

//           {/* Main Card */}
//           <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
//             {/* Header Bar */}
//             <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
//                   <svg
//                     className="w-6 h-6 text-[#4C6FFF]"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
//                       stroke="currentColor"
//                       strokeWidth="1.4"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-slate-900">
//                     Client List
//                   </h2>
//                   <p className="text-sm text-slate-500">
//                     Manage, edit or remove clients
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 to="/addclient"
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-white text-sm shadow-[0_14px_40px_rgba(76,111,255,0.55)]"
//                 style={{
//                   background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
//                 }}
//               >
//                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
//                   <path
//                     d="M12 5v14M5 12h14"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                   />
//                 </svg>
//                 Add Client
//               </Link>
//             </div>

//             {/* optional success banner */}
//             {successMessage && (
//               <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100">
//                 <div className="max-w-5xl mx-auto flex items-center justify-between">
//                   <div className="text-emerald-800 text-sm">{successMessage}</div>
//                   <button
//                     onClick={() => setSuccessMessage("")}
//                     className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded"
//                   >
//                     OK
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Search Area */}
//             <div className="px-6 py-5">
//               <form
//                 onSubmit={onSearchSubmit}
//                 className="flex flex-col md:flex-row gap-3 md:items-center"
//               >
//                 <input
//                   type="text"
//                   placeholder="Search clients..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="px-4 py-2.5 rounded-2xl w-full md:w-72 bg-[#F8F9FF] border border-[#e1e4f3] text-sm focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
//                 />

//                 <div className="flex gap-2">
//                   <button className="px-4 py-2.5 rounded-2xl bg-[#4C6FFF] text-white text-sm shadow-md hover:bg-[#3f57d9]">
//                     Search
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSearch("");
//                       loadClients("");
//                     }}
//                     className="px-4 py-2.5 rounded-2xl border border-[#e0e4ff] bg-white text-sm hover:bg-[#f3f5ff]"
//                   >
//                     Reset
//                   </button>
//                 </div>
//               </form>
//             </div>

//             {/* Table */}
//             <div className="px-6 pb-6">
//               {loading ? (
//                 <div className="text-slate-500 py-6 text-center">Loading...</div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
//                     <thead className="bg-[#F3F5FF]">
//                       <tr className="text-slate-600">
//                         <th className="py-3 px-4 text-left font-medium">Client ID</th>
//                         <th className="py-3 px-4 text-left font-medium">Name</th>
//                         <th className="py-3 px-4 text-left font-medium">Start Date</th>
//                         <th className="py-3 px-4 text-left font-medium">End Date</th>
//                         <th className="py-3 px-4 text-left font-medium">Daily Hours</th>
//                         <th className="py-3 px-4 text-left font-medium">Actions</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {clients.map((client) => (
//                         <React.Fragment key={client.clientID}>
//                           <tr className="hover:bg-[#F8F9FF] transition">
//                             <td className="py-3 px-4">{client.clientID}</td>

//                             {/* Name */}
//                             <td className="py-3 px-4">
//                               {editingId === client.clientID ? (
//                                 <input
//                                   className="w-full px-3 py-2 rounded-xl border border-[#d9dcef]"
//                                   value={formValues.client_name}
//                                   onChange={(e) =>
//                                     setFormValues({
//                                       ...formValues,
//                                       client_name: e.target.value,
//                                     })
//                                   }
//                                 />
//                               ) : (
//                                 <span className="font-medium text-slate-800">
//                                   {client.client_name}
//                                 </span>
//                               )}
//                             </td>

//                             {/* Start */}
//                             <td className="py-3 px-4">
//                               {editingId === client.clientID ? (
//                                 <input
//                                   type="date"
//                                   className="px-2 py-2 rounded-xl border border-[#d9dcef]"
//                                   value={formValues.start_date}
//                                   onChange={(e) =>
//                                     setFormValues({
//                                       ...formValues,
//                                       start_date: e.target.value,
//                                     })
//                                   }
//                                 />
//                               ) : (
//                                 client.start_date?.slice(0, 10)
//                               )}
//                             </td>

//                             {/* End */}
//                             <td className="py-3 px-4">
//                               {editingId === client.clientID ? (
//                                 <input
//                                   type="date"
//                                   className="px-2 py-2 rounded-xl border border-[#d9dcef]"
//                                   value={formValues.end_date}
//                                   onChange={(e) =>
//                                     setFormValues({
//                                       ...formValues,
//                                       end_date: e.target.value,
//                                     })
//                                   }
//                                 />
//                               ) : (
//                                 client.end_date?.slice(0, 10)
//                               )}
//                             </td>

//                             {/* Hours */}
//                             <td className="py-3 px-4">
//                               {editingId === client.clientID ? (
//                                 <input
//                                   type="number"
//                                   step="0.5"
//                                   className="px-2 py-2 rounded-xl border border-[#d9dcef] w-20"
//                                   value={formValues.daily_hours}
//                                   onChange={(e) =>
//                                     setFormValues({
//                                       ...formValues,
//                                       daily_hours: e.target.value,
//                                     })
//                                   }
//                                 />
//                               ) : (
//                                 client.daily_hours
//                               )}
//                             </td>

//                             {/* Actions */}
//                             <td className="py-3 px-4">
//                               {editingId === client.clientID ? (
//                                 <div className="flex gap-3">
//                                   <button
//                                     onClick={() => onSave(client.clientID)}
//                                     className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
//                                   >
//                                     Save
//                                   </button>
//                                   <button
//                                     onClick={onCancelEdit}
//                                     className="px-3 py-2 rounded-xl bg-slate-200"
//                                   >
//                                     Cancel
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <div className="flex gap-3">
//                                   <button
//                                     onClick={() => onStartEdit(client)}
//                                     className="p-2 rounded-xl bg-yellow-100 text-yellow-700 border border-yellow-200"
//                                   >
//                                     Edit
//                                   </button>
//                                   <button
//                                     onClick={() => setModalDeleteId(client.clientID)}
//                                     className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-200"
//                                   >
//                                     Delete
//                                   </button>
//                                 </div>
//                               )}
//                             </td>
//                           </tr>

//                           {/* Delete confirm */}
//                           {modalDeleteId === client.clientID && (
//                             <tr>
//                               <td colSpan="6" className="p-4">
//                                 <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between">
//                                   <span>
//                                     Delete <strong>{client.client_name}</strong>?
//                                   </span>
//                                   <div className="flex gap-2">
//                                     <button
//                                       className="px-3 py-1 rounded-xl bg-slate-200"
//                                       onClick={() => setModalDeleteId(null)}
//                                     >
//                                       Cancel
//                                     </button>
//                                     <button
//                                       className="px-3 py-1 rounded-xl bg-red-600 text-white"
//                                       onClick={() => onDeleteConfirmed(client.clientID)}
//                                     >
//                                       Delete
//                                     </button>
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}

//                           {/* Delete error */}
//                           {errorModalId === client.clientID && (
//                             <tr>
//                               <td colSpan="6" className="p-4">
//                                 <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-xl">
//                                   <div className="flex justify-between">
//                                     <p>Cannot delete client. Remove associated records first.</p>
//                                     <button
//                                       onClick={() => setErrorModalId(null)}
//                                       className="px-3 py-1 rounded-xl bg-indigo-600 text-white"
//                                     >
//                                       OK
//                                     </button>
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       ))}

//                       {clients.length === 0 && (
//                         <tr>
//                           <td colSpan="6" className="py-6 text-center text-slate-500">
//                             No clients found.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// src/pages/ViewClients.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import {
  getClients,
  updateClient,
  deleteClient,
} from "../services/AdminDashboard/clientservice";

const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function ViewClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [search, setSearch] = useState("");
  const [modalDeleteId, setModalDeleteId] = useState(null);
  const [errorModalId, setErrorModalId] = useState(null);

  // NEW: success message state
  const [successMessage, setSuccessMessage] = useState("");
  const successTimerRef = useRef(null);

  const accent = "#4C6FFF"; // dashboard blue

  // layout: track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    loadClients();
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };

    // update layout if sidebar toggled elsewhere (same-tab event)
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  async function loadClients(q = "") {
    setLoading(true);
    try {
      const resp = await getClients(q);
      setClients(resp.success ? resp.data?.clients ?? [] : []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  function onStartEdit(client) {
    setEditingId(client.clientID);
    setFormValues({
      client_name: client.client_name || "",
      start_date: client.start_date?.slice(0, 10) || "",
      end_date: client.end_date?.slice(0, 10) || "",
      daily_hours: client.daily_hours ?? "",
    });
  }

  function onCancelEdit() {
    setEditingId(null);
    setFormValues({});
  }

  // show success helper (auto dismiss)
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMessage(""), 3000);
  };

  async function onSave(clientId) {
    try {
      const payload = {
        client_name: formValues.client_name,
        start_date: formValues.start_date || null,
        end_date: formValues.end_date || null,
        daily_hours:
          formValues.daily_hours === "" ? null : Number(formValues.daily_hours),
      };

      const res = await updateClient(clientId, payload);
      if (res.success) {
        setClients((prev) =>
          prev.map((c) => (c.clientID === clientId ? { ...c, ...payload } : c))
        );
        onCancelEdit();

        // NEW: show success message (prefer server message if present)
        const msg =
          (res.data && (res.data.message || res.data.msg)) ||
          res.message ||
          "Client updated successfully";
        showSuccess(msg);
      } else {
        alert(res.message || "Update failed");
      }
    } catch (err) {
      alert(err.message || "Error updating");
    }
  }

  async function onDeleteConfirmed(clientId) {
    try {
      const res = await deleteClient(clientId);
      if (res.success) {
        setClients((prev) => prev.filter((c) => c.clientID !== clientId));
      } else {
        setErrorModalId(clientId);
      }
    } finally {
      setModalDeleteId(null);
    }
  }

  const onSearchSubmit = (e) => {
    e.preventDefault();
    loadClients(search.trim());
  };

  // main margin classes mirror sidebar widths: collapsed -> md:ml-20 (icons only); expanded -> md:ml-72
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72">
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6 md:py-2`} style={{ minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">
          {/* Shared Page Header */}
          <PageHeader
            section="Clients"
            title="Manage Clients"
            description="View, search, edit or remove clients."
          />

          {/* Main Card */}
          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-[#4C6FFF]" fill="none" viewBox="0 0 24 24">
                    <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Client List</h2>
                  <p className="text-sm text-slate-500">Manage, edit or remove clients</p>
                </div>
              </div>

              <Link
                to="/addclient"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-white text-sm shadow-[0_14px_40px_rgba(76,111,255,0.55)]"
                style={{ background: `linear-gradient(135deg, ${accent}, #6C5CE7)` }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Add Client
              </Link>
            </div>

            {/* optional success banner */}
            {successMessage && (
              <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                  <div className="text-emerald-800 text-sm">{successMessage}</div>
                  <button onClick={() => setSuccessMessage("")} className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded">OK</button>
                </div>
              </div>
            )}

            {/* Search Area */}
            <div className="px-6 py-5">
              <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-3 md:items-center">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl w-full md:w-72 bg-[#F8F9FF] border border-[#e1e4f3] text-sm focus:ring-2 focus:ring-[rgba(76,111,255,0.25)] focus:border-[#4C6FFF]"
                />

                <div className="flex gap-2">
                  <button className="px-4 py-2.5 rounded-2xl bg-[#4C6FFF] text-white text-sm shadow-md hover:bg-[#3f57d9]">Search</button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      loadClients("");
                    }}
                    className="px-4 py-2.5 rounded-2xl border border-[#e0e4ff] bg-white text-sm hover:bg-[#f3f5ff]"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Table */}
            <div className="px-6 pb-6">
              {loading ? (
                <div className="text-slate-500 py-6 text-center">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm divide-y divide-[#e5e7f5]">
                    <thead className="bg-[#F3F5FF]">
                      <tr className="text-slate-600">
                        <th className="py-3 px-4 text-left font-medium">Client ID</th>
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Start Date</th>
                        <th className="py-3 px-4 text-left font-medium">End Date</th>
                        <th className="py-3 px-4 text-left font-medium">Daily Hours</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {clients.map((client) => (
                        <React.Fragment key={client.clientID}>
                          <tr className="hover:bg-[#F8F9FF] transition">
                            <td className="py-3 px-4">{client.clientID}</td>

                            {/* Name */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  className="w-full px-3 py-2 rounded-xl border border-[#d9dcef]"
                                  value={formValues.client_name}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      client_name: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                <span className="font-medium text-slate-800">{client.client_name}</span>
                              )}
                            </td>

                            {/* Start */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  type="date"
                                  className="px-2 py-2 rounded-xl border border-[#d9dcef]"
                                  value={formValues.start_date}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      start_date: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                client.start_date?.slice(0, 10)
                              )}
                            </td>

                            {/* End */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  type="date"
                                  className="px-2 py-2 rounded-xl border border-[#d9dcef]"
                                  value={formValues.end_date}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      end_date: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                client.end_date?.slice(0, 10)
                              )}
                            </td>

                            {/* Hours */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  type="number"
                                  step="0.5"
                                  className="px-2 py-2 rounded-xl border border-[#d9dcef] w-20"
                                  value={formValues.daily_hours}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      daily_hours: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                client.daily_hours
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <div className="flex gap-3">
                                  <button onClick={() => onSave(client.clientID)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Save</button>
                                  <button onClick={onCancelEdit} className="px-3 py-2 rounded-xl bg-slate-200">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-3">
                                  <button onClick={() => onStartEdit(client)} className="p-2 rounded-xl bg-yellow-100 text-yellow-700 border border-yellow-200">Edit</button>
                                  <button onClick={() => setModalDeleteId(client.clientID)} className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-200">Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>

                          {/* Delete confirm */}
                          {modalDeleteId === client.clientID && (
                            <tr>
                              <td colSpan="6" className="p-4">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between">
                                  <span>Delete <strong>{client.client_name}</strong>?</span>
                                  <div className="flex gap-2">
                                    <button className="px-3 py-1 rounded-xl bg-slate-200" onClick={() => setModalDeleteId(null)}>Cancel</button>
                                    <button className="px-3 py-1 rounded-xl bg-red-600 text-white" onClick={() => onDeleteConfirmed(client.clientID)}>Delete</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Delete error */}
                          {errorModalId === client.clientID && (
                            <tr>
                              <td colSpan="6" className="p-4">
                                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-xl">
                                  <div className="flex justify-between">
                                    <p>Cannot delete client. Remove associated records first.</p>
                                    <button onClick={() => setErrorModalId(null)} className="px-3 py-1 rounded-xl bg-indigo-600 text-white">OK</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}

                      {clients.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-500">No clients found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

