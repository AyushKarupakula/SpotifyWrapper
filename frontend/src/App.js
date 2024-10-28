import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import SpotifyWrap from './components/SpotifyWrap';
import WrapHistory from './components/WrapHistory';
import Home from './components/Home';
import Login from './components/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1DB954', // Spotify green
    },
    secondary: {
      main: '#191414', // Spotify black
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wrap/history" element={<WrapHistory />} />
          <Route path="/wrap/:wrapId" element={<SpotifyWrap />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
