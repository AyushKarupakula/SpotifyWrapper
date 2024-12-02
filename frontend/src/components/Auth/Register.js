
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

/**
 * The Register component renders a registration form for new users.
 * It manages form state and handles user registration through the useAuth hook.
 * If the registration is successful, it navigates to the /dashboard route.
 * It validates that the password and confirm password fields match before submitting.
 * Displays error messages for mismatched passwords or registration failures.
 * 
 * @returns {ReactElement} The Register component.
 */
function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  /**
   * Handles the form submission by validating the form data, sending a registration
   * request to the API, and handling any errors that may occur.
   * 
   * Removes the confirmPassword field from the form data before sending to the API.
   * 
   * The function will catch any errors and display the error message to the user.
   * It will also handle different types of error responses from the API, such as
   * validation errors or generic error messages.
   * 
   * If the registration is successful, it will navigate to the /dashboard route.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      console.log('Sending registration data:', registerData); // Debug log
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err.response?.data); // Debug log
      
      // Handle different types of error responses
      if (err.response?.data?.error) {
        if (typeof err.response.data.error === 'object') {
          // Handle validation errors
          const errors = err.response.data.error;
          const errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(errorMessage);
        } else {
          setError(err.response.data.error);
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        {error && <div className="error-message" style={{whiteSpace: 'pre-line'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength="8"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength="8"
            />
          </div>
          <button type="submit" className="auth-button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register; 