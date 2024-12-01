import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spotifyAPI } from '../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton } from '@mui/material';
import './WrapHistory.css';

function WrapHistory() {
  const [wraps, setWraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, wrapId: null });

  useEffect(() => {
    fetchWrapHistory();
  }, []);

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

  const handleDeleteClick = (wrapId) => {
    setDeleteModal({ open: true, wrapId });
  };

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