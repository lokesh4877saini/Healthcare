// src/context/AuthProvider.js
"use client";
import { fetcher } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect } from 'react';
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // On mount, check for user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const logout = async () => {
    await fetcher('logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    setUser(null);
    localStorage.removeItem("user");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 
export const useAuth = () => useContext(AuthContext);
