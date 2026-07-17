import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const userId = localStorage.getItem("userId");
  const companyId = localStorage.getItem("companyId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const effectiveUserId = (localStorage.getItem("role") === "company") 
    ? companyId 
    : userId;

  if (effectiveUserId) {
    config.headers["x-user-id"] = effectiveUserId;
  }

  return config;
});

export default API;