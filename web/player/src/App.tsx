import React from 'react';
//import 'bootswatch/dist/darkly/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

// Import your components
import Home from './pages/Home';
import Player from './pages/Player';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <div>
          {/* Navigation Bar */}
          <Navbar bg="light" expand="lg" fixed="top">
            <Container>
              <Navbar.Brand as={Link} to="/">
                My React App
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                  <Nav.Link as={NavLink} to="/" end>
                    Home
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/player">
                    Player
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/profile">
                    Profile
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          {/* Main Content */}
          <Container className="mt-5">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/player" element={<Player />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Container>
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;