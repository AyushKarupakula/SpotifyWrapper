import React from 'react';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './ShareButton.css';

export const ShareButton = ({ data }) => {
  const shareUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
  const shareTitle = "Check out my Spotify Wrapped!";

  const handleTwitterShare = () => {
    const text = `${shareTitle}\n\nTop Artists:\n${data.topArtistsRecent.items.slice(0, 3).map(artist => artist.name).join(', ')}\n\nTop Tracks:\n${data.topTracksRecent.items.slice(0, 3).map(track => track.name).join(', ')}\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleInstagramShare = () => {
    alert('Screenshot your Wrapped and share it on Instagram!');
  };

  return (
    <div className="share-buttons-container">
      <div className="share-buttons">
        <button
          onClick={handleTwitterShare}
          className="share-button twitter"
          aria-label="Share on Twitter"
        >
          <FaTwitter size={24} />
        </button>
        
        <button
          onClick={handleLinkedInShare}
          className="share-button linkedin"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin size={24} />
        </button>
        
        <button
          onClick={handleInstagramShare}
          className="share-button instagram"
          aria-label="Share on Instagram"
        >
          <FaInstagram size={24} />
        </button>
      </div>
    </div>
  );
}; 