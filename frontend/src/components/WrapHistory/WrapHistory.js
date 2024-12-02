import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton } from '@mui/material';
import './WrapHistory.css';

/**
 * A component that displays the user's Spotify wrap history.
 *
 * Fetches the wrap history from the server and displays it in a grid of cards.
 * Each card contains the title of the wrap, the date it was generated, and a button
 * to view the wrap. If the user clicks the delete button on a card, a confirmation
 * modal will appear asking them to confirm the deletion. If the user confirms the
 * deletion, the wrap will be deleted from the server and the local state will be
 * updated.
 *
 * If an error occurs while fetching the wrap history, an error message will be
 * displayed.
 *
 * If the user hasn't generated any wraps yet, a message will be displayed
 * prompting them to generate their first wrap.
 */
function WrapHistory() {
  const [wraps, setWraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, wrapId: null });

  useEffect(() => {
    fetchWrapHistory();
  }, []);

  /**
   * Fetches the wrap history from the server and updates the local state.
   * If an error occurs, sets the error state and logs the error to the console.
   * Sets the loading state to false when the request is complete.
   */
  const fetchWrapHistory = async () => {
    try {
      const response = await spotifyAPI.getWrapHistory();
      setWraps(response.data.wraps);
    } catch (err) {
      setError('Failed to load wrap history');
      console.error('Error fetching wrap history:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the click event of the delete button for a wrap.
   * Opens the delete wrap modal dialog with the wrap ID to delete.
   * @param {number} wrapId - The ID of the wrap to delete.
   */
  const handleDeleteClick = (wrapId) => {
    setDeleteModal({ open: true, wrapId });
  };

  /**
   * Handles confirming the delete wrap modal dialog.
   * Deletes the wrap from the server and updates the local state.
   * If an error occurs, alerts the user with the error message.
   */
  const handleDeleteConfirm = async () => {
    try {
      await spotifyAPI.deleteWrap(deleteModal.wrapId);
      setWraps(wraps.filter(wrap => wrap.id !== deleteModal.wrapId));
      setDeleteModal({ open: false, wrapId: null });
    } catch (err) {
      console.error('Error deleting wrap:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete wrap';
      alert(errorMessage);
    }
  };

  /**
   * Handles canceling the delete wrap modal dialog.
   * Sets the deleteModal state to its initial value.
   */
  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, wrapId: null });
  };

  if (loading) return <div className="wrap-history-loading">Loading...</div>;
  if (error) return <div className="wrap-history-error">{error}</div>;

  return (
    <div className="wrap-history-container">
      <h1>Your Wrapped History</h1>
      {wraps.length > 0 ? (
        <div className="wrap-grid">
          {wraps.map((wrap) => (
            <div key={wrap.id} className="wrap-card">
              <div className="wrap-card-header">
                <h3>{wrap.title}</h3>
                <IconButton
                  className="delete-icon"
                  onClick={() => handleDeleteClick(wrap.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
              <p>Generated on: {new Date(wrap.date_generated).toLocaleDateString()}</p>
              <Link to={`/wrapped/${wrap.id}`} className="view-wrap-button">
                View Wrap
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-wraps">
          <p>You haven't generated any wraps yet!</p>
          <Link to="/wrapped" className="generate-wrap-button">
            Generate Your First Wrap
          </Link>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog
        open={deleteModal.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Wrap
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete this wrap? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default WrapHistory; 