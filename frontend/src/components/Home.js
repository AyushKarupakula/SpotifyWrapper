import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { spotifyService } from '../services/api';

/**
 * The Home component is the main entry point of the application.
 * It renders a screen with a title, a description, and two buttons.
 * The first button allows the user to generate a new Spotify wrap.
 * The second button redirects the user to the wrap history page.
 * @returns {React.ReactElement} The rendered home page.
 */
const Home = () => {
  const navigate = useNavigate();

  const handleGenerateWrap = async () => {
    try {
      const response = await spotifyService.generateWrap();
      navigate(`/wrap/${response.data.id}`);
    } catch (error) {
      console.error('Error generating wrap:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Spotify Wrapper
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Get your personalized Spotify statistics anytime
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGenerateWrap}
            sx={{ mr: 2 }}
          >
            Generate New Wrap
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/wrap/history')}
          >
            View History
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
