import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './SongGuessingGame.css';

const SongGuessingGame = ({ tracks, onComplete }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const maxRounds = 3;

  const getCurrentTrack = () => tracks[currentRound];

  const getYearOptions = (track) => {
    const actualYear = new Date(track.album.release_date).getFullYear();
    const years = [actualYear - 4, actualYear - 1, actualYear, actualYear + 4]
      .filter(year => year > 1950 && year <= new Date().getFullYear())
      .sort(() => Math.random() - 0.5);
    return [...new Set(years)];
  };

  const handleGuess = (answer) => {
    if (hasGuessed) return;

    const track = getCurrentTrack();
    const actualYear = new Date(track.album.release_date).getFullYear();
    setSelectedAnswer(answer);
    setHasGuessed(true);

    // Simplified scoring - just 1 point for exact match
    const isCorrect = answer === actualYear;
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setFeedback('Correct! +1 point');
    } else {
      setFeedback(`Not quite! It was released in ${actualYear}`);
    }

    setTimeout(() => {
      if (currentRound < maxRounds - 1) {
        setCurrentRound(currentRound + 1);
        setHasGuessed(false);
        setSelectedAnswer(null);
        setFeedback('');
      } else {
        onComplete(score + (isCorrect ? 1 : 0));
      }
    }, 2000);
  };

  if (!tracks || tracks.length < maxRounds) {
    return (
      <div className="music-quiz-game">
        <h2>Not enough tracks to play</h2>
        <p>Please try again later</p>
      </div>
    );
  }

  const currentTrack = getCurrentTrack();
  const options = getYearOptions(currentTrack);

  return (
    <motion.div 
      className="music-quiz-game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>Music Quiz</h2>
      <p>Round {currentRound + 1} of {maxRounds}</p>
      <p>Score: {score}</p>

      <div className="track-display">
        <img 
          src={currentTrack.album.images[0]?.url} 
          alt="Album Cover"
          className="album-cover"
        />
        <div className="track-info">
          <h3>{currentTrack.name}</h3>
          <p>{currentTrack.artists[0].name}</p>
        </div>
      </div>

      <p className="question">When was this song released?</p>

      <div className="options-grid">
        {options.map((year) => (
          <motion.button
            key={year}
            className={`option-button ${
              hasGuessed
                ? year === selectedAnswer
                  ? year === new Date(currentTrack.album.release_date).getFullYear()
                    ? 'correct'
                    : 'incorrect'
                  : ''
                : ''
            }`}
            onClick={() => handleGuess(year)}
            disabled={hasGuessed}
            whileHover={!hasGuessed ? { scale: 1.05 } : {}}
            whileTap={!hasGuessed ? { scale: 0.95 } : {}}
          >
            {year}
          </motion.button>
        ))}
      </div>

      {feedback && (
        <motion.div 
          className="feedback"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {feedback}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SongGuessingGame; 