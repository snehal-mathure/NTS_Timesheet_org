// ViewClients.jsx (NO EXTRA FILES)
import React, { useEffect, useState } from "react";

export default function ViewClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Load clients
  useEffect(() => {
    fetch("/admin/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      });
  }, []);

  // Start editing
  const startEdit = (client) => {
    setEditingId(client.clientID);
    setEditData({
      client_name: client.client_name,
      start_date: client.start_date,
      end_date: client.end_date,
    });
  };

  // Save edit
  const saveClient = async (clientId) => {
    const res = await fetch(`/admin/update_client/${clientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    const data = await res.json();
    if (data.success) {
      setClients((prev) =>
        prev.map((c) =>
          c.clientID === clientId ? { ...c, ...editData } : c
        )
      );
      setEditingId(null);
    } else {
      alert("Error updating client");
    }
  };

  // Delete client
  const confirmDelete = async () => {
    await fetch(`/admin/delete_client/${deleteId}`, { method: "POST" });

    setClients((prev) => prev.filter((c) => c.clientID !== deleteId));
    setModalOpen(false);
  };

  if (loading)
    return (
      <div className="p-6 text-gray-600 text-center">Loading clients...</div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Client List</h2>

      <div className="overflow-x-auto bg-white shadow-md rounded">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Client ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <React.Fragment key={client.clientID}>
                {/* Normal row */}
                {editingId !== client.clientID && (
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{client.clientID}</td>
                    <td className="px-4 py-3">{client.client_name}</td>
                    <td className="px-4 py-3">{client.start_date}</td>
                    <td className="px-4 py-3">{client.end_date}</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(client)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(client.clientID);
                            setModalOpen(true);
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Edit row */}
                {editingId === client.clientID && (
                  <tr className="bg-gray-100 border-b">
                    <td className="px-4 py-3">{client.clientID}</td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        name="client_name"
                        value={editData.client_name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            client_name: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="date"
                        name="start_date"
                        value={editData.start_date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            start_date: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="date"
                        name="end_date"
                        value={editData.end_date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            end_date: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveClient(client.clientID)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-3">
        <a
          href="/admin/add_client"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add New Client
        </a>
        <a
          href="/admin/dashboard"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Dashboard
        </a>
      </div>

      {/* Delete confirmation modal (inline, NO extra file) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md p-5 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete client{" "}
              <strong>
                {clients.find((c) => c.clientID === deleteId)?.client_name}
              </strong>
              ?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
