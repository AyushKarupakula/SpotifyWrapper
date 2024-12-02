
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { spotifyAPI } from '../../services/api';
import './Wrapped.css';
import confetti from 'canvas-confetti';

// Import all the helper components from Wrapped.js
import Wrapped, { 
  NavigationButtons, 
  CountdownTrack, 
  ArtistRow, 
  TrackRow, 
  triggerConfetti 
} from './Wrapped';

function WrappedHistory() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [wrappedData, setWrappedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wrapId } = useParams();  // Get the wrap ID from URL

  useEffect(() => {
    const fetchHistoricalWrap = async () => {
      try {
        const response = await spotifyAPI.getWrapDetail(wrapId);
        setWrappedData(response.data); // Note: adjust this based on your API response structure
      } catch (err) {
        setError('Failed to load this Wrapped data');
        console.error('Error fetching historical Wrapped data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalWrap();
  }, [wrapId]);

  // Rest of the code is identical to Wrapped.js
  const nextSlide = () => {
    if (currentSlide < slides.length) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (loading) return <div className="wrapped-loading">Loading your musical journey...</div>;
  if (error) return <div className="wrapped-error">{error}</div>;
  if (!wrappedData) return <div className="wrapped-error">No data available</div>;

  // Use the same slides array as in Wrapped.js
  const slides = [
    // Slide 1: Intro
    {
      component: (
        <motion.div className="wrapped-slide welcome-slide">
          <motion.h1>Your 2024 Wrapped</motion.h1>
          <motion.p>Let's dive into the soundtrack of your year...</motion.p>
          <NavigationButtons next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 2: Current Favorite Artists
    {
      component: (
        <motion.div className="wrapped-slide artist-highlight">
          <motion.h2>Your Recent Obsessions</motion.h2>
          <motion.p className="story-text">These artists have been on repeat lately...</motion.p>
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
          <motion.h2>Your All-Time Favorites</motion.h2>
          <motion.p className="story-text">The artists who've been there through it all...</motion.p>
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
          <motion.h2>Your Timeless Tracks</motion.h2>
          <motion.p className="story-text">The songs that never get old...</motion.p>
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
          <motion.h2>But Wait...</motion.h2>
          <motion.p className="story-text">Let's see what's been dominating your playlists recently</motion.p>
          <motion.p className="story-text-small">Your top 3 tracks of the moment coming up...</motion.p>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 6: #3 Recent Favorite
    {
      component: (
        <motion.div className="wrapped-slide countdown-slide">
          <motion.h2>Starting With #3</motion.h2>
          <motion.p className="story-text">A recent addition to your favorites...</motion.p>
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
          <motion.h2>Your #2 Recent Obsession</motion.h2>
          <motion.p className="story-text">A recent addition to your favorites...</motion.p>
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
            Your #1 Obsession
          </motion.h2>
          <motion.p 
            className="story-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            The song you just can't get enough of...
          </motion.p>
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
          <motion.h2>That's a Wrap!</motion.h2>
          <motion.div className="recap-content">
            <motion.p className="story-text">From timeless favorites to new discoveries...</motion.p>
            <motion.p className="story-text">Your musical journey continues to evolve</motion.p>
          </motion.div>
          <NavigationButtons prev={previousSlide} />
        </motion.div>
      ),
    },
  ];

  return (
    <div className="wrapped-container">
      {slides[currentSlide - 1].component}
    </div>
  );
}

export default WrappedHistory; 