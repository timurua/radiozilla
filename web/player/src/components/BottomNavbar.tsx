import { Nav, Navbar } from "react-bootstrap";
import { BsHouse, BsPerson, BsSearch } from 'react-icons/bs';
import { Link, useNavigate } from "react-router-dom";

export default function BottomNavbar() {

    const navigate = useNavigate();

    function transitionTo(e: React.MouseEvent<HTMLElement>, path: string): void {
        e.preventDefault();
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'instant' });        
    }

    return (
        <Navbar bg="dark" variant="dark">
            <Nav className="w-100 d-flex justify-content-around">
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/feed"
                        active={window.location.pathname.startsWith('/feed')}
                        className={`text-center text-light`} onClick={(e) => transitionTo(e, "/feed")}>
                        <BsHouse size={20} strokeWidth={window.location.pathname.startsWith('/feed') ? 1 : 0} />
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/search"
                        className={`text-center text-light`} onClick={(e) => transitionTo(e, "/search")}>
                        <BsSearch size={20} strokeWidth={window.location.pathname.startsWith('/search') ? 1 : 0} />
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/profile"
                        className={`text-center text-light`}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>

                        <BsPerson size={20} strokeWidth={window.location.pathname.startsWith('/profile') ? 1 : 0} />
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar>
    );
}