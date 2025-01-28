import { Nav, Navbar } from "react-bootstrap";
import { BsSearch, BsMusicNote, BsPerson } from 'react-icons/bs';
import { Link } from "react-router-dom";

export default function BottomNavbar() {
    return (
        <Navbar bg="dark" variant="dark">
            <Nav className="w-100 d-flex justify-content-around">
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/feed"
                        active={window.location.pathname.startsWith('/feed')}
                        className={`text-center text-light`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                        <BsMusicNote size={20} strokeWidth={window.location.pathname.startsWith('/feed') ? 1 : 0} />
                        <div className={window.location.pathname.startsWith('/feed') ? "fw-bold" : ""}>Listen</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/search"
                        className={`text-center text-light`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                        <BsSearch size={20} strokeWidth={window.location.pathname.startsWith('/search') ? 1 : 0} />
                        <div className={window.location.pathname.startsWith('/search') ? "fw-bold" : ""}>Search</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/profile"
                        className={`text-center text-light`}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>

                        <BsPerson size={20} strokeWidth={window.location.pathname.startsWith('/profile') ? 1 : 0} />

                        <div className={window.location.pathname.startsWith('/profile') ? "fw-bold" : ""}>Me</div>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar>
    );
}