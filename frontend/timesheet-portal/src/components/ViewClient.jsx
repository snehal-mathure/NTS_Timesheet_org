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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";
// ❗ NEW: import icons to match ProjectList.jsx buttons
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { FiRotateCcw } from "react-icons/fi";

// ❗ NEW: Pagination component import
import Pagination from "../components/Pagination";

export default function ViewClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [search, setSearch] = useState("");
  const [modalDeleteId, setModalDeleteId] = useState(null);
  const [errorModalId, setErrorModalId] = useState(null);
  const accent = "#4C6FFF";

  // layout: track sidebar collapsed state so main content margin adjusts
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  // ❗ NEW: pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadClients();
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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadClients(search.trim());
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // When clients or pageSize change, ensure current page is valid
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [clients, pageSize]);

  async function loadClients(q = "") {
    setLoading(true);
    try {
      const resp = await getClients(q);
      setClients(resp.success ? resp.data?.clients ?? [] : []);
      // reset to first page after load/search
      setPage(1);
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
    });
  }

  function onCancelEdit() {
    setEditingId(null);
    setFormValues({});
  }

  async function onSave(clientId) {
    const loadingToast = showLoading("Updating client...");

    try {
      const payload = {
        client_name: formValues.client_name,
        start_date: formValues.start_date || null,
        end_date: formValues.end_date || null,
      };

      const res = await updateClient(clientId, payload);

      toast.dismiss(loadingToast);

      if (res.success) {
        setClients((prev) =>
          prev.map((c) =>
            c.clientID === clientId ? { ...c, ...payload } : c
          )
        );
        onCancelEdit();

        showSuccess(
          res.message || res.data?.message || "Client updated successfully!"
        );
      } else {
        showError(res.message || "Update failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      showError(err.message || "Error updating client");
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
  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  // ❗ NEW: compute displayed clients for current page
  const totalItems = clients.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedClients = clients.slice(startIndex, endIndex);

  const showSuccess = (msg) =>
    toast.success(msg, {
      icon: "✅",
      style: {
        borderLeft: "6px solid #22c55e",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "14px",
      },
    });

  const showError = (msg) =>
    toast.error(msg, {
      icon: "❌",
      style: {
        borderLeft: "6px solid #ef4444",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "14px",
      },
    });

  const showLoading = (msg) =>
    toast.loading(msg, {
      style: {
        borderLeft: "6px solid #3b82f6",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "14px",
      },
    });


  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7FF" }}>
      {/* FIXED SIDEBAR */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-72">
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main className={`flex-1 transition-all duration-200 ${mainMarginClass} px-4 md:px-10 py-6 md:py-2`} style={{ minHeight: "100vh" }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          newestOnTop
          theme="light"
        />

        <div className="max-w-5xl mx-auto mt-4 md:mt-6 space-y-5">

          <PageHeader
            section="Clients"
            title="Manage Clients"
            description="View, search, edit or remove clients."
          />

          <div className="bg-white/90 border border-[#e5e7f5] rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] overflow-hidden">

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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-white text-sm"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Add Client
              </Link>
            </div>

            {/* Search */}
            <div className="px-6 py-5">
              <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-3 md:items-center">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl w-full md:w-72 bg-[#F8F9FF] border border-[#e1e4f3] text-sm"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      loadClients("");
                    }}
                    className="
                      w-10 h-10 
                      rounded-2xl 
                      flex items-center justify-center
                      bg-[#F8F9FF] 
                      border border-[#e1e4f3]
                      text-slate-600
                      hover:bg-[#e9ecff]
                      transition
                    "
                    title="Refresh"
                  >
                    <FiRotateCcw size={18} />
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
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayedClients.map((client) => (
                        <React.Fragment key={client.clientID}>
                          <tr className="hover:bg-[#F8F9FF] transition">
                            <td className="py-3 px-4">{client.clientID}</td>

                            {/* Name */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  className="w-full px-3 py-2 rounded-xl border"
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

                            {/* Start Date */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  type="date"
                                  className="px-2 py-2 rounded-xl border"
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

                            {/* End Date */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <input
                                  type="date"
                                  className="px-2 py-2 rounded-xl border"
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

                            {/* ACTION BUTTONS — UPDATED TO MATCH PROJECTLIST.JSX */}
                            <td className="py-3 px-4">
                              {editingId === client.clientID ? (
                                <div className="flex gap-3">
                                  <button onClick={() => onSave(client.clientID)}className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-medium border border-teal-300 bg-teal-100 text-teal-700 hover:bg-teal-200 hover:border-teal-400 hover:text-teal-900 transition">Save</button>
                                  <button onClick={onCancelEdit} className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex justify-start gap-2">

                                  {/* EDIT BUTTON (Exact same as ProjectList.jsx) */}
                                  <button
                                    className="p-2 rounded-xl bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 transition"
                                    onClick={() => onStartEdit(client)}
                                    title="Edit Client"
                                  >
                                    <FiEdit3 size={15} />
                                  </button>

                                  {/* DELETE BUTTON (Exact same as ProjectList.jsx) */}
                                  <button
                                    className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition"
                                    onClick={() => setModalDeleteId(client.clientID)}
                                    title="Delete Client"
                                  >
                                    <FiTrash2 size={15} />
                                  </button>

                                </div>
                              )}
                            </td>
                          </tr>

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

                  {/* ❗ NEW: Pagination component */}
                  <Pagination
                    totalItems={totalItems}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1); // move to page 1 when page size changes
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                    maxButtons={7}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
