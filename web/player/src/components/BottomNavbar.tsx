import { Nav, Navbar } from "react-bootstrap";
import { BsCompass, BsMusicNote, BsPersonCircle } from 'react-icons/bs';

export default function BottomNavbar() {
    return (
        <Navbar fixed="bottom" bg="dark" variant="dark">
            <Nav className="w-100 d-flex justify-content-around">
                <Nav.Item>
                    <Nav.Link href="/listen" className="text-center text-light">
                        <BsMusicNote size={20} />
                        <div>Listen</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/explore" className="text-center text-light">
                        <BsCompass size={20} />
                        <div>Explore</div>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/profile" className="text-center text-light">
                        <BsPersonCircle size={20} />
                        <div>Me</div>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar>
    );
}