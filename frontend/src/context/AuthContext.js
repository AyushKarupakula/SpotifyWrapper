import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkAuth();
      setUser(response.data);
    } catch (error) {
      console.error('Check auth error:', error);
      setUser(null);
      setIsSpotifyAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsSpotifyAuthenticated(false);
      localStorage.removeItem('spotifyAuthenticated');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await authAPI.deleteAccount();
      setUser(null);
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout,
      deleteAccount,
      isSpotifyAuthenticated,
      setIsSpotifyAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);