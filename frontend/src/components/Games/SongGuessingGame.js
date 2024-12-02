import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './SongGuessingGame.css';

/**
 * SongGuessingGame
 * A game that asks user to guess release year, album name, or artist collaboration
 * for a given track. User earns points for correct answers and can play up to 3 rounds.
 * After finishing the game, user can share the result on social media.
 *
 * @param {object} props
 * @prop {array} tracks Array of track objects to be used in the game.
 * @prop {function} onComplete Function to be called after user finishes the game.
 * It takes one argument, the total score of the user.
 * @returns {JSX.Element} The game component.
 */
const SongGuessingGame = ({ tracks, onComplete }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const maxRounds = 3;

  const questionTypes = [
    {
      type: 'releaseYear',
      question: 'When was this song released?',
      getOptions: (track) => {
        const actualYear = new Date(track.album.release_date).getFullYear();
        const years = [];
        for (let i = -3; i <= 3; i++) {
          const year = actualYear + i;
          if (year > 1950 && year <= new Date().getFullYear()) {
            years.push(year);
          }
        }
        return [...new Set(years)].sort(() => Math.random() - 0.5).slice(0, 4);
      },
/**
 * Checks the provided answer against the actual release year of the track.
 *
 * @param {object} track - The track object containing album release date information.
 * @param {number} answer - The year guessed by the user.
 * @returns {object} An object containing:
 * - {boolean} correct: Whether the guessed year is correct.
 * - {number} points: The points awarded for the guess.
 * - {string} message: Feedback message regarding the guess.
 */
      checkAnswer: (track, answer) => {
        const actualYear = new Date(track.album.release_date).getFullYear();
        const diff = Math.abs(answer - actualYear);
        if (diff === 0) return { correct: true, points: 3, message: 'Perfect! +3 points' };
        if (diff <= 2) return { correct: false, points: 1, message: `Close! It was ${actualYear}. +1 point` };
        return { correct: false, points: 0, message: `Not quite! It was released in ${actualYear}` };
      }
    },
    {
      type: 'albumName',
      question: 'Which album is this song from?',
/**
 * Generates a list of album name options for the user to choose from,
 * including the correct album name and several incorrect options.
 *
 * @param {object} track - The track object containing the correct album name.
 * @param {array} allTracks - An array of all track objects to source incorrect album names from.
 * @returns {array} An array of album names, shuffled in random order, containing the correct album name and up to three unique incorrect options.
 */
      getOptions: (track, allTracks) => {
        const correctAlbum = track.album.name;
        const otherAlbums = allTracks
          .filter(t => t.album.name !== correctAlbum)
          .map(t => t.album.name);
        const uniqueAlbums = [...new Set(otherAlbums)];
        const options = [correctAlbum, ...uniqueAlbums.slice(0, 3)]
          .sort(() => Math.random() - 0.5);
        return options;
      },
/**
 * Checks the provided answer against the actual album name of the track.
 *
 * @param {object} track - The track object containing the correct album name.
 * @param {string} answer - The album name guessed by the user.
 * @returns {object} An object containing:
 * - {boolean} correct: Whether the guessed album name is correct.
 * - {number} points: The points awarded for the guess.
 * - {string} message: Feedback message regarding the guess.
 */
      checkAnswer: (track, answer) => ({
        correct: answer === track.album.name,
        points: 2,
        message: answer === track.album.name ? 
          'Correct! +2 points' : 
          `Not quite! It's from ${track.album.name}`
      })
    },
    {
      type: 'artistCollaboration',
      question: 'Who collaborated on this track?',
/**
 * Generates a list of collaborator options for the user to choose from.
 * If the track has no collaborators, asks who didn't collaborate.
 * If the track has collaborators, includes the correct combination and
 * up to three other incorrect options, with the main artist and the
 * correct/wrong collaborator(s) separated by "ft.".
 *
 * @param {object} track - The track object containing the correct collaborator(s).
 * @param {array} allTracks - An array of all track objects to source incorrect collaborator(s) from.
 * @returns {array} An array of collaborator options, shuffled in random order.
 */
      getOptions: (track, allTracks) => {
        const correctArtists = track.artists.map(a => a.name);
        if (correctArtists.length === 1) {
          // If no collaborators, ask who didn't collaborate
          const otherArtists = [...new Set(allTracks
            .flatMap(t => t.artists.map(a => a.name))
            .filter(name => !correctArtists.includes(name)))];
          const options = [
            `No collaborators - ${correctArtists[0]} solo`,
            ...otherArtists.slice(0, 3).map(name => `${correctArtists[0]} ft. ${name}`)
          ].sort(() => Math.random() - 0.5);
          return options;
        } else {
          // If has collaborators, include correct combination and wrong ones
          const mainArtist = correctArtists[0];
          const otherArtists = [...new Set(allTracks
            .flatMap(t => t.artists.map(a => a.name))
            .filter(name => !correctArtists.includes(name)))];
          const correctOption = `${mainArtist} ft. ${correctArtists.slice(1).join(', ')}`;
          const options = [
            correctOption,
            ...otherArtists.slice(0, 3).map(name => `${mainArtist} ft. ${name}`)
          ].sort(() => Math.random() - 0.5);
          return options;
        }
      },
/**
 * Checks the user's answer against the correct answer, returning an object with
 * the following properties:
 *
 * - correct: A boolean indicating whether the user's answer was correct
 * - points: The number of points earned for the correct answer (2 in this case)
 * - message: A string indicating the result, either 'Correct! +2 points' or
 *   'Not quite! The correct answer is: <correct answer>'
 *
 * @param {object} track - The track object containing the correct artists.
 * @param {string} answer - The user's answer.
 * @returns {object} An object with the above properties.
 */
      checkAnswer: (track, answer) => {
        const correctArtists = track.artists.map(a => a.name);
        const correctAnswer = correctArtists.length === 1 
          ? `No collaborators - ${correctArtists[0]} solo`
          : `${correctArtists[0]} ft. ${correctArtists.slice(1).join(', ')}`;
        return {
          correct: answer === correctAnswer,
          points: 2,
          message: answer === correctAnswer ? 
            'Correct! +2 points' : 
            `Not quite! The correct answer is: ${correctAnswer}`
        };
      }
    }
  ];

  const getCurrentQuestion = () => questionTypes[currentRound % questionTypes.length];
  const getCurrentTrack = () => tracks[currentRound];

/**
 * Handles the user's guess by checking the answer against the current question.
 * Updates the score and feedback based on the result. If the guess is correct,
 * points are awarded, and the feedback indicates success; otherwise, it shows 
 * the correct answer. After a delay, proceeds to the next round or completes 
 * the game if it was the last round.
 *
 * @param {string} answer - The user's selected answer.
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