import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './SongGuessingGame.css';

/**
 * A music quiz game that asks the user to guess the release year of a song.
 * The game displays a song and its artist, and provides 4 options for the
 * release year. The user can select one of the options, and the game will
 * display feedback on whether the answer is correct or not. The game keeps
 * track of the user's score and displays it at the end of the game.
 * @param {Object[]} tracks - An array of Spotify tracks to use for the game.
 * @param {Function} onComplete - A callback function to call when the game is
 *   complete. The function will be called with the final score as an argument.
 * @returns {React.ReactElement} - A React element representing the game.
 */
const SongGuessingGame = ({ tracks, onComplete }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const maxRounds = 3;

  const getCurrentTrack = () => tracks[currentRound];

  /**
   * Returns an array of 4 year options to display in the game for a given
   * Spotify track. The array will contain the actual release year of the
   * track, as well as 3 other incorrect years. The incorrect years are
   * randomly selected to be within 3 years of the actual release year, and
   * the array is shuffled to randomize the order of the options.
   * @param {Object} track - A Spotify track object
   * @returns {number[]} - An array of 4 year options
   */
  const getYearOptions = (track) => {
    const actualYear = new Date(track.album.release_date).getFullYear();
    const yearOffsets = [-3, -2, -1, 1, 2, 3];
    const possibleYears = yearOffsets
      .map(offset => actualYear + offset)
      .filter(year => year > 1950 && year <= new Date().getFullYear());
    
    const wrongYears = possibleYears
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allYears = [...wrongYears, actualYear]
      .sort(() => Math.random() - 0.5);
    
    return allYears;
  };

  /**
   * Handles the user submitting a guess for the release year of the current
   * track. If the guess is correct, the user's score is incremented by 1, and
   * the user is shown a success message. If the guess is incorrect, the user is
   * shown a message with the actual release year. The game then waits 2
   * seconds, and if the game is not yet complete, moves on to the next track.
   * If the game is complete, calls the onComplete callback with the user's
   * final score.
   * @param {number} answer - The user's guess for the release year
   */
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