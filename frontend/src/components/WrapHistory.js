import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions 
} from '@mui/material';

/**
 * The WrapHistory component displays a list of all the SpotifyWraps that the
 * currently authenticated user has generated. Each list item displays the title
 * of the wrap, the date it was generated, and two buttons: "View Wrap" and "Delete".
 * The "View Wrap" button navigates to the wrap detail page for the corresponding
 * wrap. The "Delete" button deletes the wrap from the database.
 * 
 * If the user has not generated any wraps, the component displays a message
 * indicating this and a button to navigate to the wrap generation page.
 */
const WrapHistory = () => {
  const [wraps, setWraps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
/**
 * Fetches all the SpotifyWraps that the currently authenticated user has
 * generated and stores them in the `wraps` state. If an error occurs during
 * the fetch, logs the error to the console. Finally, sets `loading` to
 * `false`, indicating that the fetch is complete.
 */
    const fetchWraps = async () => {
      try {
        const response = await axios.get('/api/spotify/wrap/history/');
        setWraps(response.data.wraps);
      } catch (error) {
        console.error('Error fetching wraps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWraps();
  }, []);

  const handleDelete = async (wrapId) => {
    if (window.confirm('Are you sure you want to delete this wrap?')) {
      try {
        await axios.delete(`/api/spotify/wrap/${wrapId}/`);
        setWraps(wraps.filter(wrap => wrap.id !== wrapId));
      } catch (error) {
        console.error('Error deleting wrap:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Wrap History
      </Typography>
      
      {wraps.length > 0 ? (
        <Grid container spacing={3}>
          {wraps.map((wrap) => (
            <Grid item xs={12} sm={6} md={4} key={wrap.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{wrap.title}</Typography>
                  <Typography color="textSecondary">
                    Generated on: {new Date(wrap.date_generated).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link} 
                    to={`/wrap/${wrap.id}`}
                    variant="contained"
                    color="primary"
                  >
                    View Wrap
                  </Button>
                  <Button 
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(wrap.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography gutterBottom>
            You haven't generated any wraps yet!
          </Typography>
          <Button
            component={Link}
            to="/generate"
            variant="contained"
            color="primary"
          >
            Generate Your First Wrap
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default WrapHistory;
