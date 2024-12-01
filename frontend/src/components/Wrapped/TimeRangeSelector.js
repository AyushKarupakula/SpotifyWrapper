import React from 'react';
import './TimeRangeSelector.css';

const TimeRangeSelector = ({ onSelect, selectedRange, loading }) => {
  const timeRanges = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' }
  ];

  return (
    <div className="time-range-selector">
      <h2>Select Time Range</h2>
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
            {loading && selectedRange === range.value ? 'Loading...' : range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector; 