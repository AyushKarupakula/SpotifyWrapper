import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaCheck } from 'react-icons/fa';
import './ShareButton.css';

export const ShareButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <motion.button
      className="share-button"
      onClick={handleCopyLink}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {copied ? (
        <>
          <FaCheck className="share-icon" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <FaLink className="share-icon" />
          <span>Copy Link</span>
        </>
      )}
    </motion.button>
  );
}; 