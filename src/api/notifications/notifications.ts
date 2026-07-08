import API from "@/api/notifications-base-api";


export const getNotifications = (page: number = 1, status?: string) =>
  API.get("/notifications", { params: { page, status } });

export const deleteNotifications = () =>
  API.delete("/notifications");

export const getUnreadCount = () =>
  API.get("/notifications/unread-count");

export const markAllAsRead = () =>
  API.patch("/notifications/read-all");

export const markAsRead = (id: string) =>
  API.patch(`/notifications/${id}/read`);

export const markAsUnread = (id: string) =>
  API.patch(`/notifications/${id}/unread`);

export const deleteNotification = (id: string) =>
  API.delete(`/notifications/${id}`);