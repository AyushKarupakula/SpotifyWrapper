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

  const handleGuess = (answer) => {
    if (hasGuessed) return;

    const track = getCurrentTrack();
    const question = getCurrentQuestion();
    setSelectedAnswer(answer);
    setHasGuessed(true);

    const result = question.checkAnswer(track, answer);
    setScore(score + result.points);
    setFeedback(result.message);

    setTimeout(() => {
      if (currentRound < maxRounds - 1) {
        setCurrentRound(currentRound + 1);
        setHasGuessed(false);
        setSelectedAnswer(null);
        setFeedback('');
      } else {
        onComplete(score + result.points);
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
  const currentQuestion = getCurrentQuestion();
  const options = currentQuestion.getOptions(currentTrack, tracks);

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

      <p className="question">{currentQuestion.question}</p>

      <div className="options-grid">
        {options.map((option) => (
          <motion.button
            key={option}
            className={`option-button ${
              hasGuessed
                ? option === selectedAnswer
                  ? currentQuestion.checkAnswer(currentTrack, option).correct
                    ? 'correct'
                    : 'incorrect'
                  : ''
                : ''
            }`}
            onClick={() => handleGuess(option)}
            disabled={hasGuessed}
            whileHover={!hasGuessed ? { scale: 1.05 } : {}}
            whileTap={!hasGuessed ? { scale: 0.95 } : {}}
          >
            {option}
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