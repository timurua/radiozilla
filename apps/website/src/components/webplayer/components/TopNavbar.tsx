import { Navbar } from "react-bootstrap";
import { BsBell } from 'react-icons/bs';
import Link from 'next/link';
import Image from "next/image";

export default function TopNavbar() {
    return (
        <Navbar bg="dark" variant="dark" className="w-100 d-flex justify-content-between px-3" fixed="top">
            <Navbar.Brand as={Link} href="/">
                <div className="d-flex align-items-center">
                    <Image src="/radiozilla.svg" alt="Radiozilla Logo" width="30" height="30" className="mr-2" /> Radio
                </div>
            </Navbar.Brand>

            <div>
                <BsBell size={20} className="mx-2 text-light" />
            </div>
        </Navbar>
    );
}