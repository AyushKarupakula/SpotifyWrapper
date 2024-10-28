import React, { useEffect, useState } from 'react';
import { spotifyAPI } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);

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
      setPlaylists(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load playlists');
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  
  if (!isSpotifyAuthenticated) {
    return (
      <div className="dashboard">
        <div className="spotify-auth">
          <h2>Connect to Spotify</h2>
          <button onClick={handleSpotifyLogin} className="spotify-auth-button">
            Connect Spotify Account
          </button>
        </div>
      </div>
    );
  }

  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Your Playlists</h2>
      <div className="playlists-grid">
        {playlists.map(playlist => (
          <div key={playlist.id} className="playlist-card">
            <img 
              src={playlist.images[0]?.url || '/default-playlist.png'} 
              alt={playlist.name} 
            />
            <h3>{playlist.name}</h3>
            <p>{playlist.tracks.total} tracks</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 