import React, { useState, useRef, useEffect } from 'react';
import './AudioPreview.css';

/**
 * A React component that displays an audio preview with a play/pause button and
 * displays the track name. The component also handles errors and displays a
 * message if the audio fails to load or play.
 *
 * @param {string} previewUrl The URL of the audio preview.
 * @param {string} trackName The name of the track to display.
 * @returns {JSX.Element} The audio preview component.
 */

const AudioPreview = ({ previewUrl, trackName }) => {
  console.log(`Track: ${trackName}, Preview URL: ${previewUrl}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setError('Error loading audio');
      });

      audioRef.current.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
      });
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [previewUrl]);

  /**
   * Handles play/pause of the audio preview.
   *
   * If the audio is currently playing, this function will pause the audio and
   * clear the interval that is used to update the progress bar. If the audio is
   * currently paused, this function will play the audio and set up the interval
   * to update the progress bar.
   *
   * If the audio fails to play or pause, this function will catch the error and
   * set the error state to an appropriate message.
   */
  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        clearInterval(progressInterval.current);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio playing successfully');
            progressInterval.current = setInterval(() => {
              const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setProgress(progress);
            }, 100);
          }).catch(error => {
            console.error('Playback error:', error);
            setError('Error playing audio');
          });
        }
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Play/pause error:', err);
      setError('Error controlling playback');
    }
  };

/**
 * Handles the "ended" event on the audio element.
 *
 * When the audio ends, this function is called to reset the state of the audio
 * preview. It will set the isPlaying state to false, set the progress to 0, and
 * clear the interval used to update the progress bar.
 */
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    clearInterval(progressInterval.current);
  };

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="audio-preview">
      <audio
        ref={audioRef}
        src={previewUrl}
        onEnded={handleEnded}
        preload="auto"
      />
      <button 
        className={`play-button ${isPlaying ? 'playing' : ''}`}
        onClick={handlePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="track-name">{trackName}</span>
      {error && <div className="audio-error">{error}</div>}
    </div>
  );
};

export default AudioPreview; 