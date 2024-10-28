import React, { useEffect, useState } from 'react';
import { spotifyAPI } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await spotifyAPI.getUserPlaylists();
        setPlaylists(response.data);
      } catch (err) {
        setError('Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <h2>Your Playlists</h2>
      <div className="playlists-grid">
        {playlists.map(playlist => (
          <div key={playlist.id} className="playlist-card">
            <img src={playlist.images[0]?.url} alt={playlist.name} />
            <h3>{playlist.name}</h3>
            <p>{playlist.tracks.total} tracks</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 