import React from 'react';
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