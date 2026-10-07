import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('uno_token') || null);
  const [loading, setLoading] = useState(true);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  // Axios instance with Auth headers
  const authApi = axios.create({
    baseURL: `${SERVER_URL}/api`,
  });

  authApi.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Load user profile if token exists on app launch
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to load user session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    const res = await axios.post(`${SERVER_URL}/api/auth/login`, { email, password });
    const { token: newToken, user: userData } = res.data;
    
    localStorage.setItem('uno_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  // Register handler
  const register = async (username, email, password) => {
    const res = await axios.post(`${SERVER_URL}/api/auth/register`, { username, email, password });
    const { token: newToken, user: userData } = res.data;
    
    localStorage.setItem('uno_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  // Guest Login (Quick play without password)
  const loginAsGuest = (username) => {
    const guestUser = {
      _id: `guest_${Date.now()}`,
      username: username || `Player_${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png',
      isGuest: true
    };
    setUser(guestUser);
    return guestUser;
  };

  // Update user profile (e.g. avatar URL update)
  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('uno_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginAsGuest,
        updateUser,
        logout,
        authApi
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}