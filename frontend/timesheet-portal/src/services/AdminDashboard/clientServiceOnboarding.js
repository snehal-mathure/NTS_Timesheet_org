import axios from "axios";

export const API_BASE = "http://localhost:5000";

export const getClientReports = async () => {
    try {
        const response = await axios.get(`${API_BASE}/admin/client_reports?format=json`, {
            withCredentials: true,
            headers: {
                "Accept": "application/json"
            }
        });

        console.log("Raw API response:", response);
        console.log("response.data:", response.data);
        if (Array.isArray(response.data)) {
            return response.data;  // Direct array
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data.data;  // Nested { data: [...] }
        } else {
            // If it's an object with unknown structure, return empty array
            console.warn("Unexpected response structure:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching client reports:", error);
        return [];
    }
};