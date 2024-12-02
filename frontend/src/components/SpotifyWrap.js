import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

/**
 * A React component that displays a user's Spotify Wrap.
 *
 * This component fetches and presents the user's Spotify wrap data
 * as a series of slides. Each slide displays different aspects of
 * the wrap, such as top artists and tracks. Navigation buttons
 * allow users to move between slides.
 *
 * The component fetches wrap data from the backend using the
 * wrap ID from the URL parameters.
 *
 * @returns {JSX.Element} The SpotifyWrap component
 */
const SpotifyWrap = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [wrapData, setWrapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wrapId } = useParams();

  useEffect(() => {
/**
 * Fetches wrap data from the backend using the wrap ID from the URL parameters.
 *
 * Updates the `wrapData` state with the fetched wrap data.
 *
 * If an error occurs, logs the error to the console and keeps the `loading` state as false.
 *
 * @memberof SpotifyWrap
 */
    const fetchWrapData = async () => {
      try {
        const response = await axios.get(`/api/spotify/wrap/${wrapId}/`);
        setWrapData(response.data);
      } catch (error) {
        console.error('Error fetching wrap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWrapData();
  }, [wrapId]);

  if (loading) return <CircularProgress />;
  if (!wrapData) return <Typography>No data found</Typography>;

  const slides = [
    {
      id: 1,
      title: 'Welcome',
      content: <Typography variant="h2">Your Spotify Wrap</Typography>
    },
    {
      id: 2,
      title: 'Top Artists',
      content: (
        <Box className="artist-grid">
          {wrapData.data.top_artists?.slice(0, 5).map((artist) => (
            <Box key={artist.id} className="artist-card">
              <img src={artist.images[0].url} alt={artist.name} />
              <Typography variant="h6">{artist.name}</Typography>
            </Box>
          ))}
        </Box>
      )
    },
    // Add more slides...
  ];

  return (
    <Box className="wrap-container">
      {slides.map((slide) => (
        <Box
          key={slide.id}
          className={`wrap-slide ${currentSlide === slide.id ? 'active' : ''}`}
        >
          {slide.content}
        </Box>
      ))}
      <Box className="wrap-controls">
        <Button
          onClick={() => setCurrentSlide(curr => curr - 1)}
          disabled={currentSlide === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentSlide(curr => curr + 1)}
          disabled={currentSlide === slides.length}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default SpotifyWrap;
