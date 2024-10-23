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

function Player() {
  return (
    <div className="App" style={{ backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <Navbar bg="dark" variant="dark" className="w-100 d-flex justify-content-between px-3">
        <Navbar.Brand href="#">Music</Navbar.Brand>
        <div>
          <BsBell size={20} className="mx-2" />
          <BsSearch size={20} />
        </div>
      </Navbar>

      <Container className="mt-3">
        {/* Buttons Row */}
        <Row className="text-center mb-4">
          <Col>
            <Button variant="outline-light" size="sm">Podcasts</Button>
          </Col>
          <Col>
            <Button variant="outline-light" size="sm">Relax</Button>
          </Col>
          <Col>
            <Button variant="outline-light" size="sm">Energize</Button>
          </Col>
        </Row>

        <PlayablePlayer />
        <PlayableList />
          {/* Channels */}  
      </Container>

      {/* Bottom Navigation */}
      <Navbar fixed="bottom" bg="dark" variant="dark">
        <Nav className="w-100 d-flex justify-content-around">
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsHouseDoor size={20} />
              <div style={{ fontSize: '0.75rem' }}>Home</div>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsCompass size={20} />
              <div style={{ fontSize: '0.75rem' }}>Explore</div>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#" className="text-center text-light">
              <BsMusicNoteList size={20} />
              <div style={{ fontSize: '0.75rem' }}>Library</div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar>
    </div>
  );
}

export default Player;

