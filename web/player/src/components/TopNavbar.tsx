import { Navbar } from "react-bootstrap";
import { BsBell, BsSearch } from 'react-icons/bs';

export default function TopNavbar() {
    return (
        <Navbar bg="dark" variant="dark" className="w-100 d-flex justify-content-between px-3" fixed="top">
            <Navbar.Brand href="#">Podcasts</Navbar.Brand>
            <div>
                <BsBell size={20} className="mx-2 text-light" />
                <BsSearch size={20} className="mx-2 text-light" />
            </div>
        </Navbar>
    );
}