
// Import all the helper components from Wrapped.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { TrackRow, ArtistRow } from './Wrapped';
import './WrappedHistory.css';

function WrappedHistory() {
  const { t } = useLanguage();
  const [selectedWrap, setSelectedWrap] = useState(null);
  
  const wrappedHistory = React.useMemo(() => {
    const wraps = JSON.parse(localStorage.getItem('wrappedHistory') || '[]');
    const uniqueWraps = wraps.reduce((acc, current) => {
      const x = acc.find(item => item.timeRange === current.timeRange);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    
    return uniqueWraps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const getTimeRangeText = (timeRange) => {
    switch(timeRange) {
      case 'short_term':
        return 'Last 4 Weeks';
      case 'medium_term':
        return 'Last 6 Months';
      case 'long_term':
        return 'All Time';
      default:
        return '';
    }
  };

  if (wrappedHistory.length === 0) {
    return (
      <div className="wrapped-history-container">
        <h2>{t('wrappedHistory.noHistory')}</h2>
        <p>{t('wrappedHistory.generateFirst')}</p>
      </div>
    );
  }

  const handleWrapClick = (wrap) => {
    setSelectedWrap(selectedWrap?.timestamp === wrap.timestamp ? null : wrap);
  };

  return (
    <div className="wrapped-history-container">
      <h2>{t('wrappedHistory.title')}</h2>
      {wrappedHistory.map((wrap, index) => (
        <motion.div 
          key={wrap.timestamp}
          className={`wrap-entry ${selectedWrap?.timestamp === wrap.timestamp ? 'selected' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleWrapClick(wrap)}
        >
          <h3>
            {formatDate(wrap.timestamp)} • {getTimeRangeText(wrap.timeRange)}
          </h3>
          
          <AnimatePresence>
            {selectedWrap?.timestamp === wrap.timestamp && (
              <motion.div 
                className="wrap-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="top-tracks-section">
                  <h4>Your Recent Favorites</h4>
                  <p className="section-description">The songs that have been on repeat lately...</p>
                  {wrap.topTracksRecent?.items?.slice(0, 5).map((track, idx) => (
                    <TrackRow 
                      key={track.id} 
                      track={track} 
                      rank={idx}
                    />
                  ))}
                </div>

                <div className="top-tracks-section timeless">
                  <h4>Your Timeless Tracks</h4>
                  <p className="section-description">The songs that never get old...</p>
                  {wrap.topTracksAllTime?.items?.slice(0, 5).map((track, idx) => (
                    <TrackRow 
                      key={track.id} 
                      track={track} 
                      rank={idx}
                    />
                  ))}
                </div>

                <div className="top-artists-section">
                  <h4>Your Top Artists</h4>
                  <p className="section-description">These artists have been on repeat...</p>
                  {wrap.topArtistsRecent?.items?.slice(0, 5).map((artist, idx) => (
                    <ArtistRow 
                      key={artist.id} 
                      artist={artist} 
                      rank={idx}
                    />
                  ))}
                </div>

                <div className="stats-section">
                  <h4>Quick Stats</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Top Genre</span>
                      <span className="stat-value">
                        {wrap.topArtistsRecent?.items[0]?.genres?.[0] || 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Most Played Artist</span>
                      <span className="stat-value">
                        {wrap.topArtistsRecent?.items[0]?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Most Played Track</span>
                      <span className="stat-value">
                        {wrap.topTracksRecent?.items[0]?.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default WrappedHistory; 