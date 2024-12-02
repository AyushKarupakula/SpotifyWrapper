import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaCheck } from 'react-icons/fa';
import './ShareButton.css';

/**
 * ShareButton component renders a button that allows users to copy the
 * current page URL to the clipboard.
 */
export const ShareButton = () => {
  const [copied, setCopied] = useState(false);

/**
 * Copies the current page URL to the clipboard and sets the 'copied' state to true.
 * Displays a 'Copied!' message for 2 seconds. Logs an error if the copying fails.
 */
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