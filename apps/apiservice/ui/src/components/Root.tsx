import React from 'react';
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface RootProps {
    children: React.ReactNode;
}

const Root: React.FC<RootProps> = ({ children }) => {
    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="#">Radiozilla Scrapper</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/health">Health</Nav.Link>
                            <Nav.Link as={Link} to="/web-page-channel">Channel</Nav.Link>
                            <Nav.Link as={Link} to="/web-page-channels">Channels</Nav.Link>
                            <Nav.Link as={Link} to="/web-pages">Pages</Nav.Link>
                            <Nav.Link as={Link} to="/web-page-summary">Summary</Nav.Link>
                            <Nav.Link as={Link} to="/frontend-audios">Audios</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            
            <Container>
                {children}
            </Container>
            <Container className='mt-5'>
                <Row>
                    <Col>© 2025 Radiozilla Scrapper. All rights reserved.</Col>
                </Row>
                <Row>
                    <Col>Author: Timur Valiulin</Col>
                </Row>
            </Container>
        </div>
    );
};

export default Root;