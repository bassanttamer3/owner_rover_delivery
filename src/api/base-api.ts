/**
 * Shared axios instance and request/response interceptors.
 * All api/* modules should import API from here.
 */
import axios, { type InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ??
    (globalThis as any).process?.env?.VITE_API_BASE_URL;

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
    },
});

/* ===============================
   Request: attach access token
================================ */
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ===============================
   Response: logout on 401
================================ */
API.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;
