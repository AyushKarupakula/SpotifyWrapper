import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SpotifyCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
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