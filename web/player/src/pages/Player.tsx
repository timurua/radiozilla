import React, { useEffect, useState, useRef } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { BsBell, BsSearch, BsHouseDoor, BsCompass, BsMusicNoteList, BsSpeaker, BsMusicNote, BsPersonCircle } from 'react-icons/bs';
import { AudioPlayer} from '../components/AudioPlayer';
import {PlayableList} from '../components/PlayableList';
import {PlayableSortingSelector} from '../components/PlayableSortingSelector';
import { SmallAudioPlayer } from '../components/SmallAudioPlayer';

function Player() {
  const [playerMinimized, setPlayerMinimized] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const sortingSelectorRef = useRef(null);
  const navbarRef = useRef(null);

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
        <Navbar bg="dark" variant="dark" className="w-100 d-flex justify-content-between px-3" fixed="top">
          <Navbar.Brand href="#">Podcasts</Navbar.Brand>
          <div>
            <BsBell size={20} className="mx-2 text-light" />
            <BsSearch size={20} className="mx-2 text-light" />
          </div>
        </Navbar>
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

      <PlayableList />

      {/* Bottom Navigation */}
      <Navbar fixed="bottom" bg="dark" variant="dark">
        <Nav className="w-100 d-flex justify-content-around">
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsMusicNote size={20} />
              <div>Listen</div>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsCompass size={20} />
              <div>Explore</div>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsPersonCircle size={20} />
              <div>Me</div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar>
    </div>
  );
}

export default Player;
