import { Nav, Navbar } from "react-bootstrap";
import { BsCompass, BsMusicNote, BsPerson, BsPersonCircle } from 'react-icons/bs';
import { useAuth } from "../providers/AuthProvider";
import { Link } from "react-router-dom";

export default function BottomNavbar() {
    const { user } = useAuth();
    return (
        <Navbar fixed="bottom" bg="dark" variant="dark">
            <Nav className="w-100 d-flex justify-content-around">
                <Nav.Item>
                    <Nav.Link as={Link} to="/listen" className="text-center text-light">
                        <BsMusicNote size={20} />
                        <div>Listen</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/explore" className="text-center text-light">
                        <BsCompass size={20} />
                        <div>Explore</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/profile" className="text-center text-light">
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