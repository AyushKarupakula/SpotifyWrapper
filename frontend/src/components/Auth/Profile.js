import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

/**
 * Profile component showing user information and offering account deletion and message sending functionality.
 *
 * @function
 * @returns {ReactElement} The Profile component.
 */
const Profile = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  /**
   * Deletes the user's account and redirects to the home or login page.
   *
   * @function
   * @async
   * @throws {Error} If there is an error deleting the user's account
   */
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/'); // Redirect to home or login page after account deletion
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  /**
   * Handles form submission for sending a message by preventing the default form submission event,
   * alerting the user that the message has been sent, and resetting the message state.
   *
   * @function
   * @param {Event} e - The form submission event.
   */
  const handleSubmitMessage = (e) => {
    e.preventDefault();
    alert(`Message Sent: ${message}`);
    setMessage('');
  };

  const developers = [
    { name: 'Ayush', email: 'akarupakula3@gatech.edu' },
    { name: 'Daniel', email: 'dchoe34@gatech.edu' },
    { name: 'Dhruv', email: 'ddodda3@gatech.edu' },
    { name: 'Suyash', email: 'sbhardwaj70@gatech.edu' },
    { name: 'Veer', email: 'vguda6@gatech.edu' },
  ];

  return (
    <div className="profile-container">
      <div className="profile-columns">
        {/* Left Column */}
        <div className="profile-left">
          <h2 className="profile-header">Profile</h2>
          <p className="profile-username">Welcome, {user.username}!</p>
          <button onClick={handleDeleteAccount} className="auth-button delete-button">
            Delete Account
          </button>
        </div>
        
        {/* Right Column */}
        <div className="profile-right">
          <h3 className="developers-header">Developers</h3>
          <div className="developers-cards">
            {developers.map((developer, index) => (
              <div key={index} className="developer-card">
                <h4 className="developer-name">{developer.name}</h4>
                <p className="developer-email">{developer.email}</p>
              </div>
            ))}
          </div>
          
          <h3 className="message-header">Send a Message to the Developers</h3>
          <form onSubmit={handleSubmitMessage} className="developer-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Write your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-button">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;