// // src/services/clientService.js

// export async function addClient(payload) {
//   // Update this URL to match your Flask backend route
//   const url = "/api/clients";

//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     const error = await res.text();
//     throw new Error(error || "Failed to add client");
//   }

//   return res.json();
// }
// src/services/clientService.js

// =========================
// ADD NEW CLIENT
// =========================
export async function addClient(payload) {
  // Update this URL to match your Flask backend route
  const url = "/api/clients";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to add client");
  }

  return res.json();
}



// =========================
// VIEW ALL CLIENTS
// =========================
export async function getClients() {
  const res = await fetch("/api/clients", {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch clients");
  }

  return res.json();  // returns array of clients
}



// =========================
// VIEW SINGLE CLIENT (OPTIONAL)
// =========================
export async function getClientById(clientId) {
  const res = await fetch(`/api/clients/${clientId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch client");
  }

  return res.json();  // returns one client object
}
