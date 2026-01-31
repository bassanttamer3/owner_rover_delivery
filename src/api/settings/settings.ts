/**
 * Settings API. Auth-related settings (e.g. change password) use auth.
 * Add app/preference endpoints here when backend is ready.
 */
import API from "@/api/base-api";

export const getSettings = () =>
  API.get("/settings").then((r) => r.data);

export const updateSettings = (payload: Record<string, unknown>) =>
  API.patch("/settings", payload).then((r) => r.data);
