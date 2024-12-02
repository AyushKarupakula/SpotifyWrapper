
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider component providing authentication context to its children components.
 * 
 * Manages authentication state, including user information, loading status, and Spotify
 * authentication status. Provides functions to register, login, logout, and delete user
 * accounts. Utilizes a context provider to supply authentication-related state and functions
 * to its child components.
 * 
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components that will have access to the authentication context.
 * @returns {ReactElement} The AuthContext provider wrapping its children.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Checks the user's authentication status.
   * 
   * Makes a request to the backend to check if the user is authenticated.
   * If the user is authenticated, updates the user state with the response data.
   * If the user is not authenticated, sets the user state to null and
   * sets the Spotify authentication status to false.
   * @throws {Error} - If there is an error checking the user's auth status.
   */
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

  /**
   * Registers a new user.
   * 
   * Sends a registration request with the supplied user data and updates
   * the user state with the response data if successful.
   * 
   * @param {Object} userData - The user data to create a new user with.
   * @returns {Promise<Object>} - The user data from the response.
   * @throws {Error} - If the registration request fails.
   */
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

/**
 * Logs in the user with the provided credentials.
 * 
 * Sends a login request using the supplied credentials and updates
 * the user state with the response data if successful.
 * 
 * @param {Object} credentials - The user's login credentials.
 * @returns {Promise<Object>} - The user data from the response.
 * @throws {Error} - If the login request fails.
 */
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.data);
    return response.data;
  };

  /**
   * Logs out the user.
   * 
   * Sets the user to null, resets the Spotify authentication status, and removes the
   * 'spotifyAuthenticated' key from local storage.
   * 
   * @throws {Error} If there is an error logging out.
   */
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