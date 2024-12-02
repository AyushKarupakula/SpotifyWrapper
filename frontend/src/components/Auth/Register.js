import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

/**
 * Register component handles user registration.
 * 
 * This component manages the form state for user registration, including
 * fields for username, email, password, and password confirmation. It
 * validates that the password and confirmation password match before
 * submitting the data to the authentication context's register function.
 * 
 * If registration is successful, it navigates the user to the dashboard.
 * It also handles and displays error messages for validation and other
 * registration errors.
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
   * Handles the registration form submission.
   * 
   * This function prevents default form behavior, resets the error state,
   * and checks if the password and confirmation password match. If they
   * don't, it sets an error message.
   * 
   * If the passwords match, it sends the registration data to the
   * authentication context's register function. If registration is
   * successful, it navigates the user to the dashboard.
   * 
   * If there is an error, it handles different types of error responses
   * by displaying a relevant error message. If the error is a validation
   * error, it extracts the validation errors and displays a message
   * listing the fields and their respective errors. If the error is not a
   * validation error, it displays the error message from the API.
   * If there is no error message from the API, it displays a generic
   * error message.
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