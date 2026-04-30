import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type AuthPayload = { userId: string; role: string };

type AuthContextValue = {
  token: string | null;
  userId: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function decodePayload(token: string): AuthPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.userId || !payload.role) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

function loadFromStorage(): { token: string; payload: AuthPayload } | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload) return null;
  return { token, payload };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [userId, setUserId] = useState<string | null>(stored?.payload.userId ?? null);
  const [role, setRole] = useState<string | null>(stored?.payload.role ?? null);

  const login = useCallback((newToken: string) => {
    const payload = decodePayload(newToken);
    if (!payload) return;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserId(payload.userId);
    setRole(payload.role);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
