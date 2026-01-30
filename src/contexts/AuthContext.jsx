import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
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

export const useAuth = () => useContext(AuthContext);
