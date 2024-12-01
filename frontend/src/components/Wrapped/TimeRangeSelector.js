import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './TimeRangeSelector.css';

const TimeRangeSelector = ({ onSelect, selectedRange, loading }) => {
  const { t } = useLanguage();

  const timeRanges = [
    { value: 'short_term', label: t('timeRanges.shortTerm') },
    { value: 'medium_term', label: t('timeRanges.mediumTerm') },
    { value: 'long_term', label: t('timeRanges.longTerm') }
  ];

  return (
    <div className="time-range-selector">
      <h2>{t('welcome.selectTime')}</h2>
      <div className="range-buttons">
        {timeRanges.map(range => (
          <button
            key={range.value}
            className={`range-button ${selectedRange === range.value ? 'selected' : ''} ${
              loading && selectedRange === range.value ? 'loading' : ''
            }`}
            onClick={() => onSelect(range.value)}
            disabled={loading}
          >
            {loading && selectedRange === range.value ? t('common.loading') : range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector; 