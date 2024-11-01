import React, { useEffect, useState, useRef } from 'react';
import { AudioPlayer} from '../components/AudioPlayer';
import {AudioList} from '../components/AudioList';
import {PlayableSortingSelector} from '../components/PlayableSortingSelector';
import { SmallAudioPlayer } from '../components/SmallAudioPlayer';
import BottomNavbar from '../components/BottomNavbar';
import TopNavbar from '../components/TopNavbar';

function Listen() {
  const [playerMinimized, setPlayerMinimized] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const sortingSelectorRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.getBoundingClientRect().height);
    }

    const handleScroll = () => {
      if (sortingSelectorRef.current && navbarRef.current) {
        const navbarHeight = navbarRef.current.getBoundingClientRect().height;
        const sortingSelectorRect = sortingSelectorRef.current.getBoundingClientRect();

        if (sortingSelectorRect.bottom <= (navbarHeight)) {
          // PlayableSortingSelector has scrolled out of view
          setPlayerMinimized(true);
        } else {
          setPlayerMinimized(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call handler immediately to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const minimizedStyle: React.CSSProperties = playerMinimized
  ? {
    position: 'fixed',
    top: navbarHeight,
    width: '100%',
    left: 0,
    height: '50px', // Adjust the minimized height as needed
    zIndex: 1000,
    paddingTop: '40px',
    paddingLeft: '10px',
    paddingRight: '10px',
  } : { display: 'none' };


  return (
    <div className="min-vh-100">
      {/* Header */}
      <div ref={navbarRef}>
        <TopNavbar />
      </div>

      {
        playerMinimized ? (
          <div style={minimizedStyle} className='bg-dark'>
            <SmallAudioPlayer/>
          </div>
        ) : null
      }

      <div ref={sortingSelectorRef}>
        <PlayableSortingSelector />
      </div>

      <AudioPlayer/>

      <AudioList searchString={undefined}/>

      <BottomNavbar />

    </div>
  );
}

export default Listen;
