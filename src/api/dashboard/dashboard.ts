/**
 * Dashboard / analytics API. Replace with real endpoints when backend is ready.
 */
import API from "@/api/base-api";

export const getDashboardStats = () =>
  API.get("/dashboard/stats").then((r) => r.data);

export const getDashboardCharts = (params?: Record<string, unknown>) =>
  API.get("/dashboard/charts", { params }).then((r) => r.data);
