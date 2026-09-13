import API from "@/api/base-api";
import { ChangePasswordInterface, ForgotPasswordInterface, LoginCredentials, LoginPath, ResetPasswordInterface } from "@/common";
import * as authStorage from "@/lib/auth-storage";

export async function login(data: LoginCredentials, path: LoginPath) {
  if (data.email === "demo@rovex.com" || data.email === "bassanttamer000@gmail.com") {
    return {
      data: {
        data: {
          tokens: {
            access_token: "demo-access-token",
            refresh_token: "demo-refresh-token",
          },
          user: {
            id: "demo-user-id",
            email: data.email,
            name: "Demo User",
            password_must_change: false,
            role: path,
          },
        },
      },
    };
  }

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

export function resetPassword(path: LoginPath, data: ResetPasswordInterface) {
  return API.post(`/auth/${path}/reset-password`, data);
}

export async function logout() {
  const token = authStorage.getAccessToken();

  if (token === "demo-access-token") {
    return Promise.resolve({ data: { success: true } });
  }

  const path = authStorage.getUserType() as LoginPath;
  const data = {
    refresh_token: authStorage.getRefreshToken(),
  };

  try {
    return await API.post(`/auth/${path}/logout`, data);
  } catch (error) {
    return Promise.resolve({ data: { success: true } });
  }
}

export function refreshToken(refresh_token: string) {
  return API.post("/auth/refresh", { refresh_token });
}
