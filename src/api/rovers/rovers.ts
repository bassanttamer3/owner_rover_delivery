/**
 * Rovers API. Replace with real endpoints when backend is ready.
 */
import API from "@/api/base-api";

export const getRovers = (params?: Record<string, unknown>) =>
  API.get("/rovers", { params }).then((r) => r.data);

export const getRoverById = (id: string) =>
  API.get(`/rovers/${id}`).then((r) => r.data);

export const getRoverLocation = (id: string) =>
  API.get(`/rovers/${id}/location`).then((r) => r.data);
