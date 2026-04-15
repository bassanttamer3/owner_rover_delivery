import API from "@/api/base-api";
import { ChangePasswordInterface, ForgotPasswordInterface, LoginCredentials, LoginPath, ResetPasswordInterface } from "@/common";
import * as authStorage from "@/lib/auth-storage";

export function login(data: LoginCredentials, path: LoginPath) {
  return API.post(`/auth/${path}/login`, data);
}

export function changePassword(data: ChangePasswordInterface) {
  const path = authStorage.getUserType() as LoginPath;
  return API.post(`/auth/${path}/change-password`, data);
}

export function logoutAll() {
  const path = authStorage.getUserType() as LoginPath;
  return API.post(`/auth/${path}/logout-all`);
}

export function forgotPassword(data: ForgotPasswordInterface, path: LoginPath) {
  return API.post(`/auth/${path}/forgot-password`, data);
}

export function resetPassword(data: ResetPasswordInterface) {
  return API.post("/auth/fleet/reset-password", data);
}

export function logout() {
  const path = authStorage.getUserType() as LoginPath;
  const data = {
    refresh_token: authStorage.getRefreshToken(),
  };
  return API.post(`/auth/${path}/logout`, data);
}

export function refreshToken(refresh_token: string) {
  return API.post("/auth/refresh", { refresh_token });
}