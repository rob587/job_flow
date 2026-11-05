import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export const jobService = {
  search: (params) => api.post("/jobs/search", params),
  getSaved: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const preferencesService = {
  get: () => api.get("/preferences"),
  save: (preferences) => api.post("/preferences", preferences),
};

export default api;
