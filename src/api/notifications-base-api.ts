import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
});

API.interceptors.request.use((config) => {
 const token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("userId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});

export default API;