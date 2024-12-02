import React from 'react';
import axios from 'axios';

/**
 * Component for connecting a user's Spotify account to the app.
 *
 * Renders a button that initiates the Spotify authorization flow when clicked.
 * The button redirects the user to the Spotify authorization URL if one is
 * received from the backend, or logs an error if no URL is received.
 */
const SpotifyAuth = () => {
  /**
   * Initiates the Spotify authorization flow when called.
   *
   * Makes a GET request to the backend to fetch the Spotify authorization URL.
   * If the response contains an authorization URL, it redirects the user to
   * that URL to initiate the flow. If no URL is received, it logs an error.
   * If the request fails, it logs an error and the error response if applicable.
   */
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