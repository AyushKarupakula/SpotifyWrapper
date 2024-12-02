import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { spotifyService } from '../services/api';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleSpotifyLogin = async () => {
    try {
      setLoading(true);
      const response = await spotifyService.login();
      // Spotify login returns a URL to redirect to
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error during Spotify login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login with Spotify
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSpotifyLogin}
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? 'Connecting...' : 'Connect with Spotify'}
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
