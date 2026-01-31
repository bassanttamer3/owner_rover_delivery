/**
 * Notifications API. Replace with real endpoints when backend is ready.
 */
import API from "@/api/base-api";

export const getNotifications = (params?: Record<string, unknown>) =>
  API.get("/notifications", { params }).then((r) => r.data);

export const markNotificationRead = (id: string) =>
  API.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  API.post("/notifications/read-all").then((r) => r.data);
