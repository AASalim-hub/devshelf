
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5259",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export function getApiError(error) {
    if (error.response?.data?.error) {
        return error.response.data.error;
    }

    if (error.response?.data?.title) {
        return error.response.data.title;
    }

    if (error.response) {
        return `Request failed with status ${error.response.status}.`;
    }

    if (error.request) {
        return "Cannot reach the server. Check that the backend is running.";
    }

    return error.message || "Something went wrong. Please try again.";
}

export default api;
