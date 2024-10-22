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

        {/* Quick Picks */}
        <h5>Quick Picks</h5>
        <ListGroup variant="flush">
          <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
            <Image src="https://via.placeholder.com/50" rounded className="me-3" />
            <div>
              <div>Weigh, Hey and up She Rises</div>
              <small>The Irish Rovers</small>
            </div>
          </ListGroup.Item>
          <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
            <Image src="https://via.placeholder.com/50" rounded className="me-3" />
            <div>
              <div>Destination Calabria (Radio...)</div>
              <small>Alex Gaudino</small>
            </div>
          </ListGroup.Item>
          <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
            <Image src="https://via.placeholder.com/50" rounded className="me-3" />
            <div>
              <div>Substitution (feat. Julian Perretta)</div>
              <small>Purple Disco Machine</small>
            </div>
          </ListGroup.Item>
          <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
            <Image src="https://via.placeholder.com/50" rounded className="me-3" />
            <div>
              <div>Regarde-moi</div>
              <small>Kungs</small>
            </div>
          </ListGroup.Item>
        </ListGroup>

        {/* Pop Section */}
        <h5 className="mt-4">Pop</h5>
        <ListGroup variant="flush">
          <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
            <Image src="https://via.placeholder.com/50" rounded className="me-3" />
            <div>
              <div>Irish Pub Song</div>
              <small>The High Kings</small>
            </div>
          </ListGroup.Item>
        </ListGroup>
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

