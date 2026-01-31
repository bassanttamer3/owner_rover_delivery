import { Outlet } from "react-router-dom";

/**
 * Minimal layout for auth pages (login, register).
 * No sidebar or dashboard chrome. Child pages handle their own styling.
 */
const AuthLayout = () => <Outlet />;

export default AuthLayout;
