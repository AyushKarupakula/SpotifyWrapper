import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

/**
 * @function Login
 * @description Handles user login functionality.
 * @param {Object} formData - Object containing the username and password entered by the user.
 * @param {String} error - The error message to be displayed if the user enters invalid credentials.
 * @param {Function} login - The login function from the AuthContext.
 * @param {Function} navigate - The navigate function from the useNavigate hook.
 * @returns {JSX.Element} - The JSX element representing the login form.
 */
function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * Handles the login form submission.
   * 
   * Prevents the default form behavior, resets the error state, and attempts to
   * log the user in using the authentication context's login function. If the
   * login is successful, it navigates the user to the dashboard. If there is an
   * error, it handles the different types of error responses by displaying a
   * relevant error message. If the error is a validation error, it extracts the
   * validation errors and displays a message listing the fields and their
   * respective errors. If the error is not a validation error, it displays the
   * error message from the API. If there is no error message from the API, it
   * displays a generic error message.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login; 