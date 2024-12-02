import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { spotifyService } from '../services/api';

/**
 * A simple login component that redirects to the Spotify authorization URL
 * when the button is clicked. If the user is not authenticated, it displays
 * a "Connect with Spotify" button. If the user is authenticated, it displays
 * a "Connecting..." button that is disabled.
 *
 * @return {React.ReactElement} The login component.
 */
const Login = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Initiates Spotify login process.
   *
   * This function first calls the API to get the authorization URL.
   * If the request is successful, the user is redirected to the authorization URL.
   * If the request fails with an error, an error message is printed to the console.
   *
   * @async
   */
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
