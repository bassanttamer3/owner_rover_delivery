import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthContextValue = {
  user: unknown;
  userType: string | null;
  isOwner: boolean;
  isCompany: boolean;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<unknown>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    const type = localStorage.getItem("user_type");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setUserType(type);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setUserType(null);
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
