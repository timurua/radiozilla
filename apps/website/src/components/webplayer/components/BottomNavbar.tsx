import { Nav, Navbar } from "react-bootstrap";
import { BsHouse, BsPerson, BsSearch } from 'react-icons/bs';
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BottomNavbar() {

    const router = useRouter();

    function transitionTo(e: React.MouseEvent<HTMLElement>, path: string): void {
        e.preventDefault();
        router.push(path);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    return (
        <Navbar bg="dark" variant="dark">
            <Nav className="w-100 d-flex justify-content-around">
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        href="/webplayer/feed"
                        active={window.location.pathname.startsWith('/feed')}
                        className={`text-center text-light`} onClick={(e) => transitionTo(e, "/feed")}>
                        <BsHouse size={20} strokeWidth={window.location.pathname.startsWith('/feed') ? 1 : 0} />
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        href="/webplayer/search"
                        className={`text-center text-light`} onClick={(e) => transitionTo(e, "/search")}>
                        <BsSearch size={20} strokeWidth={window.location.pathname.startsWith('/search') ? 1 : 0} />
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        href="/webplayer/profile"
                        className={`text-center text-light`}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>

                        <BsPerson size={20} strokeWidth={window.location.pathname.startsWith('/profile') ? 1 : 0} />
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar>
    );
}