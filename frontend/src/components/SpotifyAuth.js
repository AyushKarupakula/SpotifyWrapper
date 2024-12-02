import React from 'react';
import axios from 'axios';

/**
 * The SpotifyAuth component initiates a request to connect with Spotify by
 * fetching the authorization URL from the backend API. If the URL is
 * successfully retrieved, it redirects the user's browser to the URL for
 * authentication. If the URL is not received or an error occurs, error messages
 * are logged to the console.
 *
 * @async
 * @returns {void}
 */
const SpotifyAuth = () => {
/**
 * Initiates a request to connect with Spotify by fetching the authorization URL.
 *
 * This function makes a GET request to the backend API to retrieve the Spotify
 * authorization URL. If the URL is successfully retrieved, it redirects the
 * user's browser to the URL for authentication. If the URL is not received or
 * an error occurs, error messages are logged to the console.
 *
 * @async
 * @returns {void}
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