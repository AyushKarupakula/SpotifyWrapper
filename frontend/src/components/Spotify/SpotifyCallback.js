import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';

function SpotifyCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          await spotifyAPI.callback({ code });
          navigate('/dashboard');  // Redirect to dashboard after successful callback
        } catch (err) {
          setError('Failed to authenticate with Spotify');
        }
      } else {
        setError('No authorization code received from Spotify');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return <div className="spotify-callback-error">{error}</div>;
  }

  return <div className="spotify-callback-loading">Connecting to Spotify...</div>;
}

export default SpotifyCallback;
