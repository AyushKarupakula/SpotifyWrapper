import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * SpotifyCallback component handles the Spotify OAuth callback process.
 * 
 * This component extracts the authorization code from the URL parameters
 * and sends it to the backend server to exchange for access tokens. If the
 * authorization code is missing or if an error occurs during the exchange,
 * the user is redirected to an error page. Upon successful authentication,
 * the user is redirected to the dashboard.
 * 
 * Effects:
 * - useEffect: Triggers the callback handling upon component mount.
 * 
 * Dependencies: useLocation, useNavigate, useEffect, axios
 * 
 * Returns a loading message while the authentication process is ongoing.
 */
const SpotifyCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Handles the Spotify OAuth callback process.
     * 
     * This function extracts the authorization code from the URL parameters
     * and sends it to the backend server to exchange for access tokens. If the
     * authorization code is missing or if an error occurs during the exchange,
     * the user is redirected to an error page. Upon successful authentication,
     * the user is redirected to the dashboard.
     * 
     * @async
     * @returns {void}
     */
    const handleCallback = async () => {
      try {
        // Get the code from URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (!code) {
          console.error('No code received from Spotify');
          navigate('/error');
          return;
        }

        // Send the code to your backend
        const response = await axios.post(
          'http://localhost:8000/api/spotify/callback/',
          { code },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.data) {
          console.log('Successfully authenticated with Spotify');
          navigate('/dashboard'); // or wherever you want to redirect after success
        }
      } catch (error) {
        console.error('Spotify callback error:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        navigate('/error'); // or handle error appropriately
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="spotify-callback">
      <h2>Connecting to Spotify...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
};

export default SpotifyCallback; 