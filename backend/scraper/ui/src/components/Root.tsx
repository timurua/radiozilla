import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface RootProps {
    children: React.ReactNode;
}

const Root: React.FC<RootProps> = ({ children }) => {
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="#">Radiozilla Scrapper</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/health">Health</Nav.Link>
                            <Nav.Link as={Link} to="/scraper">Scraper</Nav.Link>
                            <Nav.Link as={Link} to="/web-page-seeds">Seeds</Nav.Link>
                            <Nav.Link as={Link} to="/web-pages">Pages</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container>
                {children}
            </Container>
        </>
    );
};

export default Root;