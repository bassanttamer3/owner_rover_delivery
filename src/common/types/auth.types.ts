export type LoginPath = "fleet" | "company";

/** Minimal shape for the logged-in user from the API (used in AuthContext). */
export interface AuthUser {
  user_id?: string;
  id?: string;
  email?: string;
  name?: string;
  full_name?: string;
  role?: string;
  company_id?: string;
  password_must_change?: boolean;
  [key: string]: unknown;
}
