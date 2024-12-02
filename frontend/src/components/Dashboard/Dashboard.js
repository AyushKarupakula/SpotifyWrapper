
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isSpotifyAuthenticated, setIsSpotifyAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSpotifyAuth();
  }, []);

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

  const handleSpotifyLogin = async () => {
    try {
      const response = await spotifyAPI.authorize();
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError('Failed to initiate Spotify login');
    }
  };

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