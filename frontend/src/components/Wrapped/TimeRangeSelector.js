import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import './TimeRangeSelector.css';

function TimeRangeSelector({ onSelect, selectedRange, loading }) {
  const { t } = useLanguage();

  return (
    <div className="time-range-selector">
      <h2>{t('welcome.selectTime')}</h2>
      <div className="time-range-options">
        <motion.button
          className={`time-range-button ${selectedRange === 'short_term' ? 'selected' : ''}`}
          onClick={() => onSelect('short_term')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {t('timeRanges.shortTerm')}
        </motion.button>
        
        <motion.button
          className={`time-range-button ${selectedRange === 'medium_term' ? 'selected' : ''}`}
          onClick={() => onSelect('medium_term')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {t('timeRanges.mediumTerm')}
        </motion.button>
        
        <motion.button
          className={`time-range-button ${selectedRange === 'long_term' ? 'selected' : ''}`}
          onClick={() => onSelect('long_term')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {t('timeRanges.longTerm')}
        </motion.button>
      </div>
      
      {loading && <div className="loading-indicator">{t('common.loading')}</div>}
    </div>
  );
}

export default TimeRangeSelector; 