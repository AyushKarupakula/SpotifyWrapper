import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navigation/Navbar';
import Profile from './components/Auth/Profile';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import SpotifyCallback from './components/Spotify/SpotifyCallback';
import Wrapped from './components/Wrapped/Wrapped';
import WrapHistory from './components/WrapHistory/WrapHistory';
import WrappedHistory from './components/Wrapped/WrappedHistory';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';

/**
 * A protected route that checks if the user is authenticated and
 * redirects to the login page if not.
 * 
 * @param {React.ReactNode} children - The child components to be rendered
 * if the user is authenticated.
 * @returns {React.ReactNode} The child components if the user is authenticated,
 * otherwise redirects to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

/**
 * The main App component that renders all the routes.
 * 
 * This component renders the Navbar at the top, and then renders the
 * routes based on the current URL. If the user is not logged in, it
 * renders a login and register button. If the user is logged in, it
 * renders a protected route for the dashboard, wrapped, and wrap history
 * pages.
 * 
 * @returns {React.ReactNode} The rendered App component.
 */
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Navbar className="navbar" /> {/* Navbar with higher z-index */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="App-header">
              <div className="wave-background"></div> {/* Moving wave background */}
              <h1 className="glowing-text">Welcome to Spotify Wrapper</h1> {/* Glowing text */}
              {!user && (
                <div className="auth-buttons">
                  <a href="/login" className="auth-button">Login</a>
                  <a href="/register" className="auth-button">Register</a>
                </div>
              )}
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/spotify/callback" element={<SpotifyCallback />} />
        <Route
          path="/wrapped"
          element={
            <ProtectedRoute>
              <Wrapped />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wrapped/:wrapId"
          element={
            <ProtectedRoute>
              <WrappedHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wrap-history"
          element={
            <ProtectedRoute>
              <WrapHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </div>
  );
}

/**
 * The top-level component of the application.
 *
 * This component wraps the entire application with
 * the LanguageProvider and the Router, and renders the
 * AppContent component inside an AuthProvider.
 *
 * @returns {React.ReactElement} - The rendered App component.
 */
function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;
