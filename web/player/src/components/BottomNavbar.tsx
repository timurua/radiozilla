import { Nav, Navbar } from "react-bootstrap";
import { BsSearch, BsMusicNote, BsPerson, BsPersonCircle } from 'react-icons/bs';
import { useAuth } from "../providers/AuthProvider";
import { Link } from "react-router-dom";

export default function BottomNavbar() {
    const { user } = useAuth();
    return (
        <Navbar bg="dark" variant="dark">
            <Nav className="w-100 d-flex justify-content-around">
                <Nav.Item>
                    <Nav.Link as={Link} to="/feed" className="text-center text-light" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                        <BsMusicNote size={20} />
                        <div>Listen</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/search" className="text-center text-light" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                        <BsSearch size={20} />
                        <div>Search</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/profile" className="text-center text-light" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                        {user ? (
                            <BsPersonCircle size={20} />
                        ) : (<BsPerson size={20} />
                        )}
                        <div>Me</div>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar>
    );
}