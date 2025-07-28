import React, { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    // For now, let's disable the token interceptor to test basic Auth0 functionality
    // We'll re-enable this once the basic authentication is working
    console.log('Auth0 Status:', { isAuthenticated, user: user?.email });
    
    // Simple interceptor that doesn't try to get tokens yet
    const requestInterceptor = API.interceptors.request.use(
      (config) => {
        // For now, just log that we're making a request
        console.log('Making API request:', config.url);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove interceptor
    return () => {
      API.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated, user]);

  const value = {
    user,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};