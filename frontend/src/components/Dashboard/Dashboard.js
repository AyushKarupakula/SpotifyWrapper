import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

/**
 * The Dashboard component is the main page of the application.
 *
 * It checks if the user is authenticated with Spotify and renders the appropriate
 * UI. If the user is not authenticated, it renders a "Connect to Spotify" button.
 * If the user is authenticated, it renders a list of their playlists, along with
 * a "View Your Spotify Wrapped" button.
 *
 * The component does not accept any props.
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
   * Checks if the user is authenticated with Spotify.
   *
   * Makes a request to the Spotify API to fetch the user's playlists.
   * If the request is successful, it sets the `isSpotifyAuthenticated` state to true
   * and fetches the user's playlists. If the request fails with a 401 status code,
   * it sets the `isSpotifyAuthenticated` state to false. If the request fails with
   * any other status code, it sets the `error` state to an error message.
   * Finally, it sets the `loading` state to false.
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
   * Initiates the Spotify login process by calling the `authorize()` function
   * from the `spotifyAPI` and redirecting the user to the returned URL.
   *
   * If the request fails, it sets the `error` state to an error message.
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
   * Fetches the user's playlists from the Spotify API and updates the playlists state.
   *
   * Sets the `loading` state to false after fetching the playlists. If the request
   * succeeds, updates the `playlists` state with the fetched data. If the request
   * fails, sets an error message in the `error` state and also sets `loading` to false.
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