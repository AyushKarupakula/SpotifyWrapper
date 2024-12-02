import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Import theme context
import { LanguageSelector } from '../LanguageSelector/LanguageSelector'; // Import language selector
import './Navbar.css';

/**
 * @function Navbar
 * @description A functional component that renders the navigation bar of the application.
 * It displays different navigation links based on the user's authentication status.
 * Also includes a theme toggle button and a language selector component.
 * 
 * @returns {JSX.Element} The JSX element representing the application's navigation bar.
 */
function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const navigate = useNavigate();

  /**
   * Handles user logout by calling the logout function from the AuthContext and
   * then navigating to the login page.
   * @function
   * @async
   * @returns {undefined}
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`navbar ${theme}`}>
      <div className="navbar-brand">
        <Link to="/">Spotify Wrapped</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/wrap-history" className="nav-link">Wrap History</Link>
            <Link to="/login" className="nav-link" onClick={handleLogout}>Logout</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
        <button onClick={toggleTheme} className="nav-buttona">
          {theme === 'light' ? '☼' : '☾'}
        </button>
      </div>
      <div className="navbar-right">
        <LanguageSelector />
      </div>
    </nav>
  );
}

export default Navbar;