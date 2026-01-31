/**
 * Activity logs API. Replace with real endpoints when backend is ready.
 */
import API from "@/api/base-api";

export const getActivityLogs = (params?: Record<string, unknown>) =>
  API.get("/activity-logs", { params }).then((r) => r.data);

export const getActivityLogById = (id: string) =>
  API.get(`/activity-logs/${id}`).then((r) => r.data);
