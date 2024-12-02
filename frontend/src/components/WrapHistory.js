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
 * The WrapHistory component displays the user's Spotify wrap history.
 *
 * Fetches the wrap history from the server and renders a list of wrap cards.
 * Each card contains the title of the wrap, the date it was generated, and a button
 * to view the wrap and a button to delete the wrap. If the user clicks the delete
 * button, a confirmation dialog will appear asking the user to confirm the
 * deletion. If the user confirms the deletion, the wrap will be deleted from the
 * server and the local state will be updated.
 *
 * If the user hasn't generated any wraps yet, a message will be displayed
 * prompting them to generate their first wrap.
 */
const WrapHistory = () => {
  const [wraps, setWraps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  /**
   * Fetches the user's Spotify wrap history from the server and updates the
   * local state with the response data. If an error occurs, logs the error to
   * the console. Sets the loading state to false when the request is complete.
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

/**
 * Deletes a wrap after user confirmation.
 * Sends a request to delete the wrap from the server and updates local state.
 * Logs an error to the console if the deletion fails.
 * @param {number} wrapId - The ID of the wrap to delete.
 */
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
