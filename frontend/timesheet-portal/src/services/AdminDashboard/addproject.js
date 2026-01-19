
const BASE_URL = "http://127.0.0.1:5000";

// Generic GET
async function getRequest(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

// Generic POST
async function postRequest(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

// Convert response to readable error
async function getErrorMessage(res) {
  try {
    return (await res.text()) || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

/* ---------------------------
   CLIENT SERVICE FUNCTIONS
---------------------------- */

export async function getClients() {
  return await getRequest("/clients");
}

/* ---------------------------
   PROJECT SERVICE FUNCTIONS
---------------------------- */

export async function getProjects() {
  return await getRequest("/projects");
}

export async function createProject(data) {
  return await postRequest("/projects", data);
}

// Export default as grouped services (optional)
export default {
  getClients,
  getProjects,
  createProject,
};
