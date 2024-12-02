import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

/**
 * Profile is a component that renders the user's profile page.
 * It displays the user's username and provides a button to delete the account.
 * Additionally, it displays a list of the developers' names and emails and provides a form to send a message to the developers.
 * @returns {JSX.Element} The rendered profile page.
 */
const Profile = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

/**
 * Handles the account deletion process.
 * 
 * This function attempts to delete the user's account by calling the 
 * deleteAccount function from the authentication context. If the 
 * deletion is successful, it navigates the user to the homepage or login 
 * page. If an error occurs during the deletion process, it displays an 
 * alert message indicating the failure.
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
 * Handles the form submission for sending a message to the developers.
 * 
 * This function prevents default form behavior, displays an alert message
 * with the message that was sent, and resets the message state.
 * @param {Event} e The form submission event.
 */
  const handleSubmitMessage = (e) => {
    e.preventDefault();
    alert(`Thank you for submitting your message: ${message}`);
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