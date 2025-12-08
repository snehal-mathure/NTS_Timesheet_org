// import axios from "axios";

// const API_BASE = "http://127.0.0.1:5000"; // your Flask backend URL

// const projectService = {
//     getClients: async () => {
//         const res = await axios.get(`${API_BASE}/api/clients`);
//         return res.data;
//     },

//     getProjects: async () => {
//         const res = await axios.get(`${API_BASE}/api/projects`);
//         return res.data;
//     },

//     addProject: async (data) => {
//         const res = await axios.post(`${API_BASE}/api/add_project`, data);
//         return res.data;
//     },
// };

// export default projectService;

import axios from "axios";

const API_BASE = "http://127.0.0.1:5000"; // Flask backend URL

const projectService = {

    // ---------------------------
    // GET CLIENTS
    // ---------------------------
    getClients: async () => {
        const res = await axios.get(`${API_BASE}/api/clients`);
        return res.data;
    },

    // ---------------------------
    // GET PROJECTS with FILTERS
    // React sends: getProjects(filters)
    // ---------------------------
    getProjects: async (filters = {}) => {
        const res = await axios.get(`${API_BASE}/api/projects`, {
            params: {
                client: filters.client || "",
                billability: filters.billability || "",
                project_type: filters.project_type || "",
            }
        });
        return res.data;
    },

    // ---------------------------
    // ADD PROJECT
    // ---------------------------
    addProject: async (data) => {
        const res = await axios.post(`${API_BASE}/api/add_project`, data);
        return res.data;
    },

    // ---------------------------
    // UPDATE PROJECT
    // PUT /api/update_project/<id>
    // ---------------------------
    updateProject: async (id, data) => {
        const res = await axios.put(`${API_BASE}/api/update_project/${id}`, data);
        return res.data;
    },

    // ---------------------------
    // DELETE PROJECT
    // DELETE /api/delete_project/<id>
    // ---------------------------
    deleteProject: async (id) => {
        const res = await axios.delete(`${API_BASE}/api/delete_project/${id}`);
        return res.data;
    },

};

export default projectService;