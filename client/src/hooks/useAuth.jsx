import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sf_token');
    const savedUser = localStorage.getItem('sf_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sf_token');
        localStorage.removeItem('sf_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signin', email, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Sign in failed');
    const { user: u, token: t } = json.data;
    setUser(u); setToken(t);
    localStorage.setItem('sf_token', t);
    localStorage.setItem('sf_user', JSON.stringify(u));
    return json.data;
  };

  const signUp = async (email, password, fullName) => {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', email, password, full_name: fullName })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Sign up failed');
    const { user: u, token: t } = json.data;
    setUser(u); setToken(t);
    localStorage.setItem('sf_token', t);
    localStorage.setItem('sf_user', JSON.stringify(u));
    return json.data;
  };

  const signOut = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
