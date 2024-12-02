import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spotifyAPI } from '../../services/api';
import './Wrapped.css';
import confetti from 'canvas-confetti';
import AudioPreview from '../AudioPreview/AudioPreview';
import TimeRangeSelector from './TimeRangeSelector';
import SongGuessingGame from '../Games/SongGuessingGame';
import { ShareButton } from '../ShareButton/ShareButton';
import { useLanguage } from '../../context/LanguageContext';

// Define components first
export const NavigationButtons = ({ prev, next }) => {
  const { t } = useLanguage();
  
  return (
    <div className="navigation-buttons">
      {prev && (
        <motion.button
          onClick={prev}
          className="nav-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('navigation.previous')}
        </motion.button>
      )}
      {next && (
        <motion.button
          onClick={next}
          className="nav-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('navigation.next')}
        </motion.button>
      )}
    </div>
  );
};

export const CountdownTrack = ({ track, number, isFinale = false }) => (
  <motion.div 
    className={`countdown-track}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div className="track-number">#{number}</motion.div>
    <img 
      src={track.album.images[0]?.url} 
      alt="" 
      className="track-image"
    />
    <div className="track-info">
      <h3>{track.name}</h3>
      <p>{track.artists[0].name}</p>
      <AudioPreview 
        previewUrl={track.preview_url}
        trackName={track.name}
      />
    </div>
  </motion.div>
);

// Helper component for artist rows
export const ArtistRow = ({ artist, rank }) => (
  <motion.div 
    className="artist-row"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.1 }}
  >
    <div className="rank">#{rank + 1}</div>
    <img 
      src={artist.images[0]?.url} 
      alt="" 
      className="artist-image"
    />
    <div className="artist-info">
      <h3>{artist.name}</h3>
      <p className="genres">{artist.genres?.slice(0, 2).join(' • ') || 'Genre unavailable'}</p>
    </div>
  </motion.div>
);

// Helper component for track rows (similar to ArtistRow)
export const TrackRow = ({ track, rank }) => (
  <motion.div 
    className="track-row"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.1 }}
  >
    <div className="rank">#{rank + 1}</div>
    <img 
      src={track.album.images[0]?.url} 
      alt="" 
      className="track-image"
    />
    <div className="track-info">
      <h3>{track.name}</h3>
      <p className="artist-name">{track.artists[0].name}</p>
      <AudioPreview 
        previewUrl={track.preview_url}
        trackName={track.name}
      />
    </div>
  </motion.div>
);

// Simplified confetti function
export const triggerConfetti = () => {
  // Initial burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  // Follow-up bursts
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.6 }
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.6 }
    });
  }, 400);
};

// Replace the existing slideVariants with these cooler variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    y: 0,
    opacity: 0,
    scale: 0.8,
    rotate: direction > 0 ? 10 : -10,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000,
    y: 0,
    opacity: 0,
    scale: 0.8,
    rotate: direction < 0 ? 10 : -10,
  })
};

function Wrapped() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [wrappedData, setWrappedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTimeRange, setLoadingTimeRange] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [gameScore, setGameScore] = useState(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    createWrapped(timeRange);
  }, []);

  const createWrapped = async (selectedRange) => {
    setLoadingTimeRange(true);
    setError(null);
    try {
      const response = await spotifyAPI.createWrapped(selectedRange);
      console.log('Wrapped Data Response:', response.data);
      
      const formattedData = {
        topTracksRecent: { items: response.data.topTracks.items },
        topTracksAllTime: { items: response.data.topTracks.items },
        topArtistsRecent: { items: response.data.topArtists.items },
        topArtistsAllTime: { items: response.data.topArtists.items }
      };
      
      setWrappedData(formattedData);
    } catch (err) {
      console.error('Error creating Wrapped:', err);
      setError('Failed to create your Wrapped');
    } finally {
      setLoadingTimeRange(false);
    }
  };

  const handleTimeRangeSelect = (range) => {
    setTimeRange(range);
    createWrapped(range);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length) {
      setDirection(1);
      setLoading(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setLoading(false);
      }, 500);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 1) {
      setDirection(-1);
      setLoading(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setLoading(false);
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="wrapped-container">
        <div className="wrapped-slide">
          <h2>Loading your musical journey...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapped-container">
        <div className="wrapped-slide">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => createWrapped(timeRange)}>Try Again</button>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Intro with TimeRangeSelector
    {
      component: (
        <motion.div className="wrapped-slide welcome-slide">
          <motion.h1>{t('welcome.title')}</motion.h1>
          <TimeRangeSelector 
            onSelect={handleTimeRangeSelect}
            selectedRange={timeRange}
            loading={loadingTimeRange}
          />
          {wrappedData && <NavigationButtons next={nextSlide} />}
        </motion.div>
      ),
    },

    // Slide 2: Current Favorite Artists
    {
      component: (
        <motion.div className="wrapped-slide artist-highlight">
          <motion.h2>{t('slides.recentObsessions')}</motion.h2>
          <motion.p className="story-text">{t('slides.artistsOnRepeat')}</motion.p>
          <div className="artists-list">
            {wrappedData?.topArtistsRecent?.items?.slice(0, 5).map((artist, index) => (
              <ArtistRow 
                key={artist.id} 
                artist={artist} 
                rank={index}
              />
            ))}
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 3: All-Time Favorite Artists
    {
      component: (
        <motion.div className="wrapped-slide artist-highlight">
          <motion.h2>{t('slides.allTimeFavorites')}</motion.h2>
          <motion.p className="story-text">{t('slides.artistsThroughItAll')}</motion.p>
          <div className="artists-list">
            {wrappedData?.topArtistsAllTime?.items?.slice(0, 5).map((artist, index) => (
              <ArtistRow 
                key={artist.id} 
                artist={artist} 
                rank={index}
              />
            ))}
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 4: All-Time Favorite Songs
    {
      component: (
        <motion.div className="wrapped-slide all-time-tracks">
          <motion.h2>{t('slides.timelessTracks')}</motion.h2>
          <motion.p className="story-text">{t('slides.neverGetOld')}</motion.p>
          <div className="tracks-list">
            {wrappedData?.topTracksAllTime?.items?.slice(0, 5).map((track, index) => (
              <TrackRow 
                key={track.id} 
                track={track} 
                rank={index}
              />
            ))}
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 5: Intro to Recent Favorites (But Wait slide)
    {
      component: (
        <motion.div 
          className="wrapped-slide"  // Just using wrapped-slide class
        >
          <motion.h2>{t('slides.butWait')}</motion.h2>
          <motion.p className="story-text">{t('slides.recentlyDominating')}</motion.p>
          <motion.p className="story-text-small">{t('slides.top3Coming')}</motion.p>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 6: #3 Recent Favorite
    {
      component: (
        <motion.div className="wrapped-slide countdown-slide">
          <motion.h2>{t('slides.startingWith3')}</motion.h2>
          <motion.p className="story-text">{t('slides.recentAddition')}</motion.p>
          {wrappedData?.topTracksRecent?.items?.[2] && (
            <CountdownTrack track={wrappedData.topTracksRecent.items[2]} number={3} />
          )}
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 7: #2 Recent Favorite
    {
      component: (
        <motion.div className="wrapped-slide">
          <motion.h2>{t('slides.number2Obsession')}</motion.h2>
          <motion.p className="story-text">{t('slides.recentAddition')}</motion.p>
          {wrappedData?.topTracksRecent?.items?.[1] && (
            <CountdownTrack track={wrappedData.topTracksRecent.items[1]} number={2} />
          )}
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 8: #1 Recent Favorite
    {
      component: (
        <motion.div 
          className="wrapped-slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onAnimationComplete={() => setTimeout(triggerConfetti, 100)}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('slides.number1Obsession')}
          </motion.h2>
          {wrappedData?.topTracksRecent?.items?.[0] && (
            <>
              <motion.img 
                src={wrappedData.topTracksRecent.items[0].album.images[0]?.url} 
                alt="" 
                className="track-image"
                initial={{ scale: 0.9 }}
                animate={{ 
                  scale: 1,
                  rotate: [0, -3, 3, -3, 0]
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  rotate: {
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.2
                  }
                }}
              />
              <motion.h3 
                className="finale-song-name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {wrappedData.topTracksRecent.items[0].name}
              </motion.h3>
              <motion.p 
                className="finale-artist-name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {wrappedData.topTracksRecent.items[0].artists[0].name}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <AudioPreview 
                  previewUrl={wrappedData.topTracksRecent.items[0].preview_url}
                  trackName={wrappedData.topTracksRecent.items[0].name}
                />
              </motion.div>
            </>
          )}
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 9: Recap
    {
      component: (
        <motion.div className="wrapped-slide recap-slide">
          <motion.h2>{t('slides.thatsAWrap')}</motion.h2>
          <motion.div className="recap-content">
            <motion.p className="story-text">{t('slides.fromTimeless')}</motion.p>
            <motion.p className="story-text">{t('slides.journey')}</motion.p>
            <ShareButton data={wrappedData} />
          </motion.div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 10: Game Introduction
    {
      component: (
        <motion.div className="wrapped-slide">
          <motion.h2>{t('slides.readyForChallenge')}</motion.h2>
          <motion.p className="story-text">{t('slides.testKnowledge')}</motion.p>
          <motion.p className="story-text-small">{t('slides.listenAndGuess')}</motion.p>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 11: Game
    {
      component: (
        <motion.div className="wrapped-slide game-slide">
          <SongGuessingGame 
            tracks={wrappedData?.topTracksRecent?.items || []}
            onComplete={(score) => {
              setGameScore(score);
              nextSlide();
            }}
          />
        </motion.div>
      ),
    },

    // Slide 12: Game Results
    {
      component: (
        <motion.div className="wrapped-slide game-results">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t('slides.gameResults')}
          </motion.h2>
          <motion.div
            className="score-display"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3>{t('slides.youScored')}</h3>
            <div className="score">{gameScore}/3</div>
            <p>{
              gameScore === 3 ? "Perfect! You really know your music!" :
              gameScore === 2 ? "Great job! You're quite familiar with your top tracks!" :
              gameScore === 1 ? "Not bad! Keep listening to discover more!" :
              "Time to spend more time with your favorite tracks!"
            }</p>
          </motion.div>
          <NavigationButtons prev={previousSlide} />
        </motion.div>
      ),
    }
  ];

  return (
    <div className="wrapped-container">
      <motion.div
        key={currentSlide}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 200, damping: 25 },
          opacity: { duration: 0.3 },
          rotate: { type: "spring", stiffness: 200, damping: 25 },
          scale: { type: "spring", stiffness: 300, damping: 25 },
        }}
      >
        {slides[currentSlide - 1].component}
      </motion.div>
    </div>
  );
}

export default Wrapped;