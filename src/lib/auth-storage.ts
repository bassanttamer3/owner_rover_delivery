/**
 * Single source of truth for auth data in localStorage.
 * All auth read/write should go through this module so we can change
 * storage strategy or keys in one place.
 */

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  USER_TYPE: "user_type",
} as const;

export type StoredUser = Record<string, unknown>;

export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(KEYS.ACCESS_TOKEN, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(KEYS.REFRESH_TOKEN, token);
}

export function getUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as StoredUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function getUserType(): string | null {
  return localStorage.getItem(KEYS.USER_TYPE);
}

export function setUserType(userType: string): void {
  localStorage.setItem(KEYS.USER_TYPE, userType);
}

/** Clear all auth data (e.g. on logout or 401). */
export function clear(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

/** Check if the user is currently authenticated (has token and user). */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() && getUser());
}
