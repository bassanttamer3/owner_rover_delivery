/**
 * Orders API. Replace with real endpoints when backend is ready.
 */
import API from "@/api/base-api";

export const getOrders = (params?: Record<string, unknown>) =>
  API.get("/orders", { params }).then((r) => r.data);

export const getOrderById = (id: string) =>
  API.get(`/orders/${id}`).then((r) => r.data);

export const updateOrderStatus = (id: string, status: string) =>
  API.patch(`/orders/${id}`, { status }).then((r) => r.data);
