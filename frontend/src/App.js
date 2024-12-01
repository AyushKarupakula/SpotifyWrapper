import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navigation/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import SpotifyCallback from './components/Spotify/SpotifyCallback';
import Wrapped from './components/Wrapped/Wrapped';
import WrapHistory from './components/WrapHistory/WrapHistory';
import WrappedHistory from './components/Wrapped/WrappedHistory';
import './App.css';

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

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <div className="App-header">
            <h1>Welcome to Spotify Wrapper</h1>
            {!user && (
              <div className="auth-buttons">
                <a href="/login" className="auth-button">Login</a>
                <a href="/register" className="auth-button">Register</a>
              </div>
            )}
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/spotify/callback" element={<SpotifyCallback />} />
        <Route path="/wrapped" element={
          <ProtectedRoute>
            <Wrapped />
          </ProtectedRoute>
        } />
        <Route path="/wrapped/:wrapId" element={
          <ProtectedRoute>
            <WrappedHistory />
          </ProtectedRoute>
        } />
        <Route path="/wrap-history" element={
          <ProtectedRoute>
            <WrapHistory />
          </ProtectedRoute>
        } />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
