import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/api';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        credentials: 'include' // Include cookies for session
      });
      const data = await response.json();
      
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to backend login route
    window.location.href = `${import.meta.env.VITE_API_URL}/login`;
  };

  const logout = () => {
    // Redirect to backend logout route
    window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};