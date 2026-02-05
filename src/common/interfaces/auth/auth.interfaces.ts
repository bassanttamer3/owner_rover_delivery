/**
 * Auth feature interfaces.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordInterface {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
export interface ForgotPasswordInterface {
  email: string;
}

export interface ResetPasswordInterface {
  token: string;
  user_id: string;
  new_password: string;
}