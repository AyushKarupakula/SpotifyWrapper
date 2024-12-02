import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider component that provides authentication-related state and methods 
 * to its children via context.
 * 
 * This component manages user authentication state, including user data, loading 
 * status, and Spotify authentication status. It provides functions for user 
 * registration, login, logout, and account deletion by interacting with the 
 * authentication API. The context values are available to any component within 
 * the AuthProvider tree.
 * 
 * State Variables:
 * - user: Object representing the authenticated user or null if not authenticated.
 * - loading: Boolean indicating if authentication status is being checked.
 * - isSpotifyAuthenticated: Boolean indicating if the user is authenticated with Spotify.
 * 
 * Effects:
 * - useEffect: Triggers authentication check on component mount.
 * 
 * Functions:
 * - checkAuth: Verifies user authentication status and updates user state.
 * - register: Registers a new user and updates user state.
 * - login: Logs in a user and updates user state.
 * - logout: Logs out the current user and clears user state.
 * - deleteAccount: Deletes the current user's account and clears user state.
 * 
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that can access the auth context.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifies user authentication status and updates user state.
   * 
   * This function first attempts to fetch the user's data from the authentication API.
   * If the request is successful, the user is considered authenticated and the user data is stored.
   * If the request fails, the user is considered not authenticated and the user data is cleared.
   * Regardless of the outcome, the loading status is set to false.
   * 
   * @async
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
 * Registers a new user and updates user state.
 * 
 * This function sends user registration data to the authentication API.
 * If the registration is successful, it updates the user state with the
 * returned user data. If an error occurs during registration, it logs
 * the error and rethrows it for further handling.
 * 
 * @async
 * @param {Object} userData - The registration data including username, email, and password.
 * @returns {Object} The registered user data from the API response.
 * @throws Will throw an error if the registration process fails.
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
   * Logs in a user and updates user state.
   * 
   * This function sends the user's login credentials to the authentication API.
   * If the login is successful, it updates the user state with the returned
   * user data. If an error occurs during login, it logs the error and rethrows
   * it for further handling.
   * 
   * @async
   * @param {Object} credentials - The user's login credentials, including username and password.
   * @returns {Object} The logged-in user data from the API response.
   * @throws Will throw an error if the login process fails.
   */
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.data);
    return response.data;
  };

/**
 * Logs out the current user and clears user state.
 * 
 * This function calls the logout endpoint of the authentication API to log out
 * the user. It resets the user state, clears the Spotify authentication status,
 * and removes the 'spotifyAuthenticated' flag from local storage. If an error
 * occurs during logout, it logs the error to the console.
 * 
 * @async
 * @throws Will log an error if the logout process fails.
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

  /**
   * Deletes the current user's account and clears user state.
   * 
   * This function calls the deleteAccount endpoint of the authentication API to
   * delete the user's account. It resets the user state. If an error occurs during
   * account deletion, it logs the error to the console and rethrows it for further
   * handling.
   * 
   * @async
   * @throws Will log an error and rethrow it if the account deletion process fails.
   */
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