import React, { useState, useRef, useEffect } from 'react';
import './AudioPreview.css';

/**
 * A component to display an audio preview for a given track, with play/pause
 * controls and a progress bar. When the audio is playing, the progress bar
 * will fill up accordingly. If there is an error loading or playing the audio,
 * an error message will be displayed.
 *
 * @param {string} previewUrl the URL of the audio preview
 * @param {string} trackName the name of the track being previewed
 * @return {React.ReactElement} the component element
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
   * Handles the play/pause button being clicked. If the audio is already playing,
   * it will pause the audio and clear the interval that updates the progress bar.
   * If the audio is not playing, it will play the audio and set up the interval to
   * update the progress bar every 100ms. If there is an error loading or playing
   * the audio, an error message will be displayed.
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
   * Handles the audio element's `ended` event. Resets the isPlaying state, progress bar
   * value, and clears the interval that updates the progress bar.
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