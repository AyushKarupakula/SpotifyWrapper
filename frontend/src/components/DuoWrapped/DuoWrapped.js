
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { spotifyAPI } from '../../services/api';
import './DuoWrapped.css';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  NavigationButtons, 
  CountdownTrack, 
  ArtistRow, 
  TrackRow, 
  triggerConfetti 
} from '../Wrapped/Wrapped';

//duo wrappe
function DuoWrapped() {
  const [sharedWrap, setSharedWrap] = useState(null);
  const [currentUserWrap, setCurrentUserWrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  
  const { user } = useAuth();
  const { wrapId } = useParams();
  const [searchParams] = useSearchParams();
  const sharedBy = searchParams.get('sharedBy');

  useEffect(() => {
    const fetchWrappedData = async () => {
      try {
        setLoading(true);
        
        // Fetch both wraps in parallel
        const [sharedWrapResponse, currentUserWrapResponse] = await Promise.all([
          spotifyAPI.getWrapDetail(wrapId),
          spotifyAPI.getWrappedData()
        ]);

        setSharedWrap(sharedWrapResponse.data);
        setCurrentUserWrap(currentUserWrapResponse.data.wrap_data);
      } catch (err) {
        console.error('Error fetching wrapped data:', err);
        setError('Failed to load wrapped data');
      } finally {
        setLoading(false);
      }
    };

    if (wrapId && user) {
      fetchWrappedData();
    }
  }, [wrapId, user]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!sharedWrap || !currentUserWrap) return <div>No data available</div>;

  const slides = [
    // Slide 1: Intro
    {
      component: (
        <motion.div className="wrapped-slide welcome-slide">
          <motion.h1>Duo Wrapped: You & {sharedBy}</motion.h1>
          <motion.p>Let's compare your musical journeys...</motion.p>
          <NavigationButtons next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 2: Recent Artists Comparison
    {
      component: (
        <motion.div className="wrapped-slide artist-highlight">
          <motion.h2>Recent Obsessions</motion.h2>
          <motion.p className="story-text">Here's what you've both been listening to lately...</motion.p>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your Recent Favorites</h3>
              <div className="artists-list">
                {currentUserWrap?.topArtistsRecent?.items?.slice(0, 5).map((artist, index) => (
                  <ArtistRow key={artist.id} artist={artist} rank={index} />
                ))}
              </div>
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s Recent Favorites</h3>
              <div className="artists-list">
                {sharedWrap?.topArtistsRecent?.items?.slice(0, 5).map((artist, index) => (
                  <ArtistRow key={artist.id} artist={artist} rank={index} />
                ))}
              </div>
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 3: Top Artists Comparison
    {
      component: (
        <motion.div className="wrapped-slide artist-comparison">
          <motion.h2>Your Top Artists</motion.h2>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your Favorites</h3>
              <div className="artists-list">
                {currentUserWrap?.topArtistsAllTime?.items?.slice(0, 5).map((artist, index) => (
                  <ArtistRow key={artist.id} artist={artist} rank={index} />
                ))}
              </div>
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s Favorites</h3>
              <div className="artists-list">
                {sharedWrap?.topArtistsAllTime?.items?.slice(0, 5).map((artist, index) => (
                  <ArtistRow key={artist.id} artist={artist} rank={index} />
                ))}
              </div>
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 4: Recent Tracks Comparison
    {
      component: (
        <motion.div className="wrapped-slide tracks-highlight">
          <motion.h2>Recent Top Tracks</motion.h2>
          <motion.p className="story-text">The songs currently on repeat...</motion.p>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your Current Rotation</h3>
              <div className="tracks-list">
                {currentUserWrap?.topTracksRecent?.items?.slice(0, 5).map((track, index) => (
                  <TrackRow key={track.id} track={track} rank={index} />
                ))}
              </div>
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s Current Rotation</h3>
              <div className="tracks-list">
                {sharedWrap?.topTracksRecent?.items?.slice(0, 5).map((track, index) => (
                  <TrackRow key={track.id} track={track} rank={index} />
                ))}
              </div>
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 5: Top Tracks Comparison
    {
      component: (
        <motion.div className="wrapped-slide tracks-comparison">
          <motion.h2>Your Top Tracks</motion.h2>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your Favorites</h3>
              <div className="tracks-list">
                {currentUserWrap?.topTracksAllTime?.items?.slice(0, 5).map((track, index) => (
                  <TrackRow key={track.id} track={track} rank={index} />
                ))}
              </div>
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s Favorites</h3>
              <div className="tracks-list">
                {sharedWrap?.topTracksAllTime?.items?.slice(0, 5).map((track, index) => (
                  <TrackRow key={track.id} track={track} rank={index} />
                ))}
              </div>
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 6: Top 3 Countdown Intro
    {
      component: (
        <motion.div className="wrapped-slide">
          <motion.h2>But Wait...</motion.h2>
          <motion.p className="story-text">Let's see what's been dominating your playlists recently...</motion.p>
          <motion.p className="story-text-small">A head-to-head of your top tracks right now</motion.p>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 7: #3 Comparison
    {
      component: (
        <motion.div className="wrapped-slide countdown-slide">
          <motion.h2>#3 Tracks</motion.h2>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your #3</h3>
              {currentUserWrap?.topTracksRecent?.items?.[2] && (
                <CountdownTrack track={currentUserWrap.topTracksRecent.items[2]} number={3} />
              )}
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s #3</h3>
              {sharedWrap?.topTracksRecent?.items?.[2] && (
                <CountdownTrack track={sharedWrap.topTracksRecent.items[2]} number={3} />
              )}
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 8: #2 Comparison
    {
      component: (
        <motion.div className="wrapped-slide countdown-slide">
          <motion.h2>#2 Tracks</motion.h2>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your #2</h3>
              {currentUserWrap?.topTracksRecent?.items?.[1] && (
                <CountdownTrack track={currentUserWrap.topTracksRecent.items[1]} number={2} />
              )}
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s #2</h3>
              {sharedWrap?.topTracksRecent?.items?.[1] && (
                <CountdownTrack track={sharedWrap.topTracksRecent.items[1]} number={2} />
              )}
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Slide 9: #1 Comparison with Confetti
    {
      component: (
        <motion.div 
          className="wrapped-slide countdown-slide"
          onAnimationComplete={() => setTimeout(triggerConfetti, 100)}
        >
          <motion.h2>#1 Tracks</motion.h2>
          <div className="duo-comparison">
            <div className="comparison-side">
              <h3>Your #1</h3>
              {currentUserWrap?.topTracksRecent?.items?.[0] && (
                <motion.div
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
                >
                  <CountdownTrack 
                    track={currentUserWrap.topTracksRecent.items[0]} 
                    number={1} 
                    isFinale={true}
                  />
                </motion.div>
              )}
            </div>
            <div className="comparison-side">
              <h3>{sharedBy}'s #1</h3>
              {sharedWrap?.topTracksRecent?.items?.[0] && (
                <motion.div
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
                >
                  <CountdownTrack 
                    track={sharedWrap.topTracksRecent.items[0]} 
                    number={1} 
                    isFinale={true}
                  />
                </motion.div>
              )}
            </div>
          </div>
          <NavigationButtons prev={previousSlide} next={nextSlide} />
        </motion.div>
      ),
    },

    // Final Slide
    {
      component: (
        <motion.div 
          className="wrapped-slide recap-slide"
          onAnimationComplete={() => setTimeout(triggerConfetti, 100)}
        >
          <motion.h2>That's Your Duo Wrapped!</motion.h2>
          <motion.div className="recap-content">
            <motion.p className="story-text">Two unique musical journeys...</motion.p>
            <motion.p className="story-text">Thanks for sharing your music taste!</motion.p>
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

export default DuoWrapped;