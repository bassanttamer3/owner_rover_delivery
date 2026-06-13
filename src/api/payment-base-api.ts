import axios, { InternalAxiosRequestConfig } from "axios";
import * as authStorage from "@/lib/auth-storage";

export const API_PAYMENT_BASE_URL: string =
    import.meta.env.VITE_API_PAYMENT_BASE_URL ??
    (typeof globalThis !== "undefined" && (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.VITE_API_ECOMMERCE_BASE_URL) ??
    "";

const API_PAYMENT = axios.create({
    baseURL: API_PAYMENT_BASE_URL,
    headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
    },
});

API_PAYMENT.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API_PAYMENT.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            authStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API_PAYMENT;