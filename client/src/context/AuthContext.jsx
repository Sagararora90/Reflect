import React, { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on load
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user'); // Basic user info
    
    if (token && savedUser) {
        setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.msg || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
  };

  const register = async (name, email, password, role) => {
      const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
          const errorMessage = data.errors ? data.errors[0].msg : (data.msg || 'Registration failed');
          throw new Error(errorMessage);
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
  };

  const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
