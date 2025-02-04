import { Navbar } from "react-bootstrap";
import { BsBell } from 'react-icons/bs';

export default function TopNavbar() {
    return (
        <Navbar bg="dark" variant="dark" className="w-100 d-flex justify-content-between px-3" fixed="top">
            <Navbar.Brand href="#"><img src="/radiozilla.svg" alt="Radiozilla Logo" height="30" className="mr-2" /> Radio</Navbar.Brand>

            <div>
                <BsBell size={20} className="mx-2 text-light" />
            </div>
        </Navbar>
    );
}