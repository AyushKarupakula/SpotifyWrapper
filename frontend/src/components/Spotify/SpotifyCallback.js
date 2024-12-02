import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Handles the Spotify OAuth callback, exchanges code for tokens, and stores them.
 *
 * This component renders a loading screen while the code is being exchanged for tokens.
 * If the exchange is successful, the user is redirected to the dashboard.
 * If the exchange fails, an error message is displayed with a button to return to the dashboard.
 *
 * State Variables:
 * - error: Error message in case of a failure.
 * - loading: Boolean indicating if the code is being exchanged.
 *
 * Effects:
 * - useEffect: Triggers the code exchange on component mount.
 *
 * @async
 */
function SpotifyCallback() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsSpotifyAuthenticated } = useAuth();

  useEffect(() => {
  /**
   * Handles the Spotify OAuth callback, exchanges code for tokens, and stores them.
   *
   * @async
   */
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      
      console.log('Current URL:', window.location.href);
      
      if (code) {
        try {
          const response = await spotifyAPI.callback({ code });
          if (response.data.message === 'Successfully authenticated with Spotify') {
            setIsSpotifyAuthenticated(true);
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Spotify callback error:', err);
          setError('Failed to authenticate with Spotify. Please try again.');
        }
      } else {
        setError('No authorization code received from Spotify');
      }
      setLoading(false);
    };

    handleCallback();
  }, [navigate, location, setIsSpotifyAuthenticated]);

  if (loading) {
    return (
      <div className="spotify-callback-container">
        <div className="loading-spinner">Connecting to Spotify...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="spotify-callback-container">
        <div className="error-message">
          {error}
          <button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default SpotifyCallback; 