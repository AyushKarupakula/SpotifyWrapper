import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * A basic navigation bar with links to the home page, my wraps, and
 * the login page.
 * 
 * @returns {JSX.Element} The navigation bar
 */
const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ 
          flexGrow: 1, 
          textDecoration: 'none', 
          color: 'inherit' 
        }}>
          Spotify Wrapper
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/wrap/history"
          >
            My Wraps
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/login"
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
