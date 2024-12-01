import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/'); // Redirect to home or login page after account deletion
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-header">Profile</h2>
      <p className="profile-username">Welcome, {user.username}!</p>
      <button onClick={handleDeleteAccount} className="auth-button delete-button">
        Delete Account
      </button>
    </div>
  );
};

export default Profile;
