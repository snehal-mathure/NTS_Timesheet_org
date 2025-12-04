import axios from "axios";

const API_BASE = "http://127.0.0.1:5000"; // your Flask backend URL

const projectService = {
    getClients: async () => {
        const res = await axios.get(`${API_BASE}/api/clients`);
        return res.data;
    },

    getProjects: async () => {
        const res = await axios.get(`${API_BASE}/api/projects`);
        return res.data;
    },

    addProject: async (data) => {
        const res = await axios.post(`${API_BASE}/api/add_project`, data);
        return res.data;
    },
};

export default projectService;

