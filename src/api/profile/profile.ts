/**
 * Profile API. Replace with real endpoints when backend is ready.
 */
import API from "@/api/base-api";

export const getProfile = () =>
  API.get("/profile").then((r) => r.data);

export const updateProfile = (payload: Record<string, unknown>) =>
  API.patch("/profile", payload).then((r) => r.data);
