import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { TrackRow, ArtistRow } from './Wrapped';
import './WrappedHistory.css';

function WrappedHistory() {
  const { t } = useLanguage();
  const [selectedWrap, setSelectedWrap] = useState(null);
  
  // Get wraps and remove duplicates based on timestamp
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
    
    // Sort by timestamp, most recent first
    return uniqueWraps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

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
            {new Date(wrap.timestamp).toLocaleDateString()} - 
            {wrap.timeRange === 'short_term' ? t('timeRange.shortTerm') :
             wrap.timeRange === 'medium_term' ? t('timeRange.mediumTerm') :
             t('timeRange.longTerm')}
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
                <div className="top-artists-section">
                  <h4>{t('wrappedHistory.topArtists')}</h4>
                  {wrap.topArtistsRecent?.items?.slice(0, 5).map((artist, idx) => (
                    <ArtistRow 
                      key={artist.id} 
                      artist={artist} 
                      rank={idx}
                    />
                  ))}
                </div>

                <div className="top-tracks-section">
                  <h4>{t('wrappedHistory.topTracks')}</h4>
                  {wrap.topTracksRecent?.items?.slice(0, 5).map((track, idx) => (
                    <TrackRow 
                      key={track.id} 
                      track={track} 
                      rank={idx}
                    />
                  ))}
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