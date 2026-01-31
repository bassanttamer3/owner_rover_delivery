/**
 * Auth-related API: login, refresh, change password.
 */
import API from "@/api/base-api";
import { LoginCredentials } from "@/common";

export const loginFleet = (data: LoginCredentials) =>
  API.post("/auth/fleet/login", data);

export const loginCompany = (data: LoginCredentials) =>
  API.post("/auth/company/login", data);

export const refreshToken = (refresh_token: string) =>
  API.post("/auth/refresh", { refresh_token });

export const changePassword = (
  current_password: string,
  new_password: string,
  confirm_password: string
) =>
  API.post("/auth/fleet/change-password", {
    current_password,
    new_password,
    confirm_password,
  });
