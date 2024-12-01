import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spotifyAPI } from '../../services/api';
import './Wrapped.css';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import AudioPreview from '../AudioPreview/AudioPreview';
import TimeRangeSelector from './TimeRangeSelector';
import SongGuessingGame from '../Games/SongGuessingGame';

// Define components first
export const NavigationButtons = ({ prev, next }) => (
  <div className="navigation-buttons">
    {prev && (
      <motion.button
        onClick={prev}
        className="nav-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Previous
      </motion.button>
    )}
    {next && (
      <motion.button
        onClick={next}
        className="nav-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Next
      </motion.button>
    )}
  </div>
);

export const CountdownTrack = ({ track, number, isFinale = false }) => (
  <motion.div 
    className={`countdown-track`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div className="track-number">#{number}</motion.div>
    <img 
      src={track.album.images[0]?.url} 
      alt="" 
      className="track-image"
    />
    <div className="track-info">
      <h3>{track.name}</h3>
      <p>{track.artists[0].name}</p>
      <AudioPreview 
        previewUrl={track.preview_url}
        trackName={track.name}
      />
    </div>
  </motion.div>
);

export const ArtistRow = ({ artist, rank }) => (
  <motion.div 
    className="artist-row"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.1 }}
  >
    <div className="rank">#{rank + 1}</div>
    <img 
      src={artist.images[0]?.url} 
      alt="" 
      className="artist-image"
    />
    <div className="artist-info">
      <h3>{artist.name}</h3>
      <p className="genres">{artist.genres?.slice(0, 2).join(' • ') || 'Genre unavailable'}</p>
    </div>
  </motion.div>
);

export const TrackRow = ({ track, rank }) => (
  <motion.div 
    className="track-row"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.1 }}
  >
    <div className="rank">#{rank + 1}</div>
    <img 
      src={track.album.images[0]?.url} 
      alt="" 
      className="track-image"
    />
    <div className="track-info">
      <h3>{track.name}</h3>
      <p className="artist-name">{track.artists[0].name}</p>
      <AudioPreview 
        previewUrl={track.preview_url}
        trackName={track.name}
      />
    </div>
  </motion.div>
);

export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.6 }
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.6 }
    });
  }, 400);
};

export const ShareDuoButton = ({ wrappedData, wrapId }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const generateDuoLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/duo-wrapped/join/${wrapId}?sharedBy=${encodeURIComponent(user.username)}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateDuoLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      className="share-duo-button"
      onClick={handleCopyLink}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={!wrapId}
    >
      {copied ? 'Link Copied!' : 'Create Duo Wrapped Link'}
    </motion.button>
  );
};

function Wrapped() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [wrappedData, setWrappedData] = useState(null);
  const [wrapId, setWrapId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTimeRange, setLoadingTimeRange] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [gameScore, setGameScore] = useState(null);

  useEffect(() => {
    const fetchWrappedData = async () => {
      try {
        const response = await spotifyAPI.getWrappedData();
        setWrappedData(response.data.wrap_data);
        setWrapId(response.data.id);
      } catch (err) {
        setError('Failed to load your Wrapped data');
        console.error('Error fetching Wrapped data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWrappedData();
  }, []);

  const createWrapped = async (selectedRange) => {
    setLoadingTimeRange(true);
    setError(null);
    try {
      const response = await spotifyAPI.createWrapped(selectedRange);
      const formattedData = {
        topTracksRecent: { items: response.data.topTracks.items },
        topTracksAllTime: { items: response.data.topTracks.items },
        topArtistsRecent: { items: response.data.topArtists.items },
        topArtistsAllTime: { items: response.data.topArtists.items }
      };
      setWrappedData(formattedData);
    } catch (err) {
      console.error('Error creating Wrapped:', err);
      setError('Failed to create your Wrapped');
    } finally {
      setLoadingTimeRange(false);
    }
  };

  const handleTimeRangeSelect = (range) => {
    setTimeRange(range);
    createWrapped(range);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length) {
      setLoading(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setLoading(false);
      }, 500);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 1) {
      setLoading(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setLoading(false);
      }, 500);
    }
  };

  // Error and Loading states omitted for brevity

  const slides = [
    // Slides content here...
  ];

  return (
    <div className="wrapped-container">
      {slides[currentSlide - 1].component}
    </div>
  );
}

export default Wrapped;