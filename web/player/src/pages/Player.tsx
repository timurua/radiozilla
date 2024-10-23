// import React from 'react';

// const Player: React.FC = () => {
//   return (
//     <div>
//       <h1>Player Page</h1>
//       <p>This is the player page.</p>
//     </div>
//   );
// };

// export default Player;


import React from 'react';
import { Button, Container, Row, Col, Navbar, Nav, ListGroup, Image, Stack } from 'react-bootstrap';
import { BsBell, BsSearch, BsHouseDoor, BsCompass, BsMusicNoteList } from 'react-icons/bs';
import { PlayablePlayer } from '../components/PlayablePlayer';
import { PlayableList } from '../components/PlayableList';
import { PlayableSortingSelector } from '../components/PlayableSortingSelector';

function Player() {
  return (
    <div className="min-vh-100">
      {/* Header */}

      <Navbar bg="dark" variant="dark" className="w-100 d-flex justify-content-between px-3" fixed="top">
        <Navbar.Brand href="#">Podcasts</Navbar.Brand>
        <div>
          <BsBell size={20} className="mx-2 text-light" />
          <BsSearch size={20} className="mx-2 text-light"/>
        </div>
      </Navbar>

      <PlayableSortingSelector />
      <PlayablePlayer />
      <PlayableList/>

      {/* Bottom Navigation */}
      <Navbar fixed="bottom" bg="dark" variant="dark">
        <Nav className="w-100 d-flex justify-content-around">
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsHouseDoor size={20} />
              <div>Home</div>
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
              <BsMusicNoteList size={20} />
              <div>Library</div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar>
    </div>
  );
}

export default Player;

