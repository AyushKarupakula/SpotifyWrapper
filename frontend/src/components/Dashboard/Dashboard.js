import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

/**
 * Dashboard component for displaying user playlists and Spotify authentication status.
 * 
 * This component manages Spotify authentication, fetches and displays the user's playlists, and provides UI for the user to connect to Spotify if not authenticated.
 * 
 * State Variables:
 * - playlists: Array of user's playlists.
 * - loading: Boolean indicating if the playlists are being loaded.
 * - error: Error message in case of a failure.
 * 
 * Effects:
 * - useEffect: Triggers Spotify authentication check on component mount.
 * 
 * Functions:
 * - checkSpotifyAuth: Checks and updates Spotify authentication status.
 * - handleSpotifyLogin: Initiates Spotify login process.
 * - fetchPlaylists: Fetches user's playlists from Spotify API.
 * 
 * Conditional Rendering:
 * - Displays loading screen, error message, Spotify connection prompt, or playlists based on current state.
 */
function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSpotifyAuthenticated, setIsSpotifyAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSpotifyAuth();
  }, []);

  /**
   * Checks Spotify authentication status and updates state accordingly.
   * 
   * This function first attempts to fetch the user's playlists from Spotify API.
   * If the request is successful, the user is considered authenticated and the playlists are fetched.
   * If the request fails with a 401 status code, the user is considered not authenticated.
   * If the request fails with any other status code, an error message is set.
   * 
   * @async
   */
  const checkSpotifyAuth = async () => {
    try {
      await spotifyAPI.getUserPlaylists();
      setIsSpotifyAuthenticated(true);
      fetchPlaylists();
    } catch (err) {
      if (err.response?.status === 401) {
        setIsSpotifyAuthenticated(false);
      } else {
        setError('Failed to check Spotify authentication');
      }
      setLoading(false);
    }
  };

  /**
   * Initiates Spotify login process.
   * 
   * This function first fetches the authorization URL from the Spotify API.
   * If the request is successful, the user is redirected to the authorization URL.
   * If the request fails with an error, an error message is set.
   * 
   * @async
   */
  const handleSpotifyLogin = async () => {
    try {
      const response = await spotifyAPI.authorize();
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError('Failed to initiate Spotify login');
    }
  };

  /**
   * Fetches user playlists from Spotify API.
   * 
   * This function first makes a request to the Spotify API to fetch the user's playlists.
   * If the request is successful, the playlists are stored in the state and the loading state is disabled.
   * If the request fails with an error, an error message is set and the loading state is disabled.
   * 
   * @async
   */
  const fetchPlaylists = async () => {
    try {
      const response = await spotifyAPI.getUserPlaylists();
      setPlaylists(response.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load playlists');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!isSpotifyAuthenticated) {
    return (
      <div className="dashboard-connect">
        <h2>Connect to Spotify</h2>
        <button onClick={handleSpotifyLogin}>Connect Spotify Account</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {isSpotifyAuthenticated && (
        <div className="dashboard-actions">
          <button 
            className="wrapped-button"
            onClick={() => navigate('/wrapped')}
          >
            View Your Spotify Wrapped
          </button>
        </div>
      )}

      <h2>Your Playlists</h2>
      <div className="playlist-grid">
        {playlists.map((playlist) => (
          <div key={playlist?.id || Math.random()} className="playlist-card">
            {playlist?.images?.[0]?.url ? (
              <img 
                src={playlist.images[0].url} 
                alt={playlist?.name || 'Playlist'} 
              />
            ) : (
              <div className="playlist-no-image">No Image</div>
            )}
            <h3>{playlist?.name || 'Untitled Playlist'}</h3>
            <p>{playlist?.tracks?.total || 0} tracks</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 