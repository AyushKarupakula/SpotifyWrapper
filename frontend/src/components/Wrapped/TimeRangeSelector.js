import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import './TimeRangeSelector.css';

/**
 * A component that renders a range of time ranges for the user to select from, and handles
 * the state of which range is currently selected. The component will also show a loading
 * animation when the user is currently fetching data for the selected range.
 *
 * @param {Object} props - The component props.
 * @prop {Function} onSelect - A function that will be called when the user selects a different
 * range. The function should take a single argument, the value of the selected range.
 * @prop {String} selectedRange - The currently selected range. Should be one of the values
 * in the `timeRanges` array.
 * @prop {Boolean} loading - A boolean indicating whether or not the component is currently
 * loading data for the selected range.
 */
const TimeRangeSelector = ({ onSelect, selectedRange, loading }) => {
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