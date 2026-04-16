import { createContext, useContext, useState, ReactNode } from "react";

import { loadString, saveString, remove } from "@/utils/storage";

const AUTH_TOKEN_KEY = "auth_token";

type AuthContextValue = {
  isAuthenticated: boolean;
  setAuthToken: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => loadString(AUTH_TOKEN_KEY) !== null,
  );

  function setAuthToken(token: string) {
    saveString(AUTH_TOKEN_KEY, token);
    setIsAuthenticated(true);
  }

  function signOut() {
    remove(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
