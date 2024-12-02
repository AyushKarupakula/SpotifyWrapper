
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { spotifyService } from '../services/api';

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
