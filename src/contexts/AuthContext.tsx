import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authStorage from "@/lib/auth-storage";
import type { AuthUser } from "@/common/types/auth.types";
import type { LoginPath } from "@/common";

export type AuthContextValue = {
  user: AuthUser | null;
  userType: string | null;
  isOwner: boolean;
  isCompany: boolean;
  loading: boolean;
  logout: () => void;
  /** Call after successful login to persist and set auth state. */
  setAuth: (tokens: { access_token: string; refresh_token: string }, user: AuthUser, loginType: LoginPath) => void;
  /** Call after token refresh to update access token only. */
  setToken: (accessToken: string) => void;
  /** Call when user profile is updated (e.g. password_must_change). */
  updateUser: (updates: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    const savedUser = authStorage.getUser();
    const type = authStorage.getUserType();

    if (token && savedUser) {
      setUser(savedUser as AuthUser);
      setUserType(type);
    } else {
      setUser(null);
      setUserType(null);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setUserType(null);
  };

  const setAuth = (
    tokens: { access_token: string; refresh_token: string },
    newUser: AuthUser,
    loginType: LoginPath
  ) => {
    authStorage.setAccessToken(tokens.access_token);
    authStorage.setRefreshToken(tokens.refresh_token);
    authStorage.setUserType(loginType);
    authStorage.setLoginType(loginType);
    authStorage.setUser(newUser);
    setUser(newUser);
    setUserType(loginType);
  };

  const setToken = (accessToken: string) => {
    authStorage.setAccessToken(accessToken);
    setUser((prev) => prev);
    setUserType((prev) => prev);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    const current = authStorage.getUser();
    if (!current) return;
    const next = { ...current, ...updates } as AuthUser;
    authStorage.setUser(next);
    setUser(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        isOwner: userType === "fleet",
        isCompany: userType === "company",
        loading,
        logout,
        setAuth,
        setToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
