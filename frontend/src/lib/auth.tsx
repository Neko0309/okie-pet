import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** i18next translation key for a client-side error (no server detail available) */
  errorKey: string | null;
  /** raw detail message from the API, if the server provided one (not localized) */
  errorDetail: string | null;
  /** set when login fails specifically because the account isn't verified yet */
  unverifiedEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  clearUnverifiedEmail: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "okiepet_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function loadUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function login(email: string, password: string) {
    setErrorKey(null);
    setErrorDetail(null);
    setUnverifiedEmail(null);
    try {
      const body = new URLSearchParams({ username: email, password });
      const res = await api.post<{ access_token: string }>("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem(TOKEN_KEY, res.data.access_token);
      await loadUser();
    } catch (e: any) {
      if (e?.response?.data?.detail === "email_not_verified") {
        setUnverifiedEmail(email);
      } else {
        setErrorKey("account.error_login");
      }
      throw new Error("login failed");
    }
  }

  async function register(email: string, password: string, fullName: string) {
    setErrorKey(null);
    setErrorDetail(null);
    try {
      await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (typeof detail === "string") {
        setErrorDetail(detail);
      } else {
        setErrorKey("account.error_register_default");
      }
      throw e;
    }
  }

  async function verifyEmail(email: string, code: string) {
    setErrorKey(null);
    setErrorDetail(null);
    try {
      const res = await api.post<{ access_token: string }>("/auth/verify-email", {
        email,
        code,
      });
      localStorage.setItem(TOKEN_KEY, res.data.access_token);
      setUnverifiedEmail(null);
      await loadUser();
    } catch {
      setErrorKey("account.error_verify");
      throw new Error("verify failed");
    }
  }

  async function resendCode(email: string) {
    await api.post("/auth/resend-verification", { email });
  }

  function clearUnverifiedEmail() {
    setUnverifiedEmail(null);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        errorKey,
        errorDetail,
        unverifiedEmail,
        login,
        register,
        verifyEmail,
        resendCode,
        clearUnverifiedEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
