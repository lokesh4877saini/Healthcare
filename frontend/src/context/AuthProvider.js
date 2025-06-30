// src/context/AuthProvider.js
"use client";
import { createContext, useContext, useState,useEffect } from 'react';

export const AuthContext = createContext();
// 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, check for user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 
export const useAuth = () => useContext(AuthContext);
