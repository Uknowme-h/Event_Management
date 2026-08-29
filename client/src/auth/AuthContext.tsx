import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { clearToken, getToken, setToken } from "@/api/client";
import { loginApi, meApi, signupApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import type { User } from "@/types";

type AuthStatus = "booting" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [user, setUser] = useState<User | null>(null);
  const booted = useRef(false);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("ready");
  }, []);

  // Boot: if a token exists, verify it with /api/auth/me
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const token = getToken();
    if (!token) {
      setStatus("ready");
      return;
    }

    meApi()
      .then((u) => {
        setUser(u);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        // 401 → expired token, clear it. Network error → keep token, try again later.
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
        }
        setUser(null);
        setStatus("ready");
      });
  }, []);

  // Listen for 401s dispatched by the API client during authenticated calls
  useEffect(() => {
    window.addEventListener("auth:logout", logout);
    return () => window.removeEventListener("auth:logout", logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await loginApi(email, password);
    setToken(token);
    setUser(u);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { user: u, token } = await signupApi(name, email, password);
    setToken(token);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
