import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

/**
 * The SpotifyWrap component displays a Spotify wrap for a given wrapId.
 *
 * The component fetches the wrap data from the server and stores it in the component's state.
 * It then renders a series of slides, each displaying a different aspect of the wrap data.
 *
 * The component also renders a set of controls at the bottom of the page, allowing the user
 * to navigate through the slides.
 *
 * If the component is still loading the data, it renders a circular progress indicator.
 * If the component encounters an error while fetching the data, it renders an error message.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.wrapId - The ID of the Spotify wrap to display.
 */
const SpotifyWrap = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [wrapData, setWrapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wrapId } = useParams();

  useEffect(() => {
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
