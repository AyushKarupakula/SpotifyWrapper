import React from 'react';
import axios from 'axios';

const SpotifyAuth = () => {
  const handleSpotifyConnect = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/spotify/auth/', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.auth_url) {
        console.log('Redirecting to:', response.data.auth_url);
        window.location.href = response.data.auth_url;
      } else {
        console.error('No auth URL received');
      }
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  return (
    <button onClick={handleSpotifyConnect} className="spotify-connect-btn">
      Connect Spotify Account
    </button>
  );
};

export default SpotifyAuth; 