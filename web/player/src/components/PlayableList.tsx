import { Image, ListGroup } from "react-bootstrap";

export function PlayableList() {
    return (
        <>
            <h5>Quick Picks</h5>
            <ListGroup variant="flush">
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Weigh, Hey and up She Rises</div>
                        <small>The Irish Rovers</small>
                    </div>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Destination Calabria (Radio...)</div>
                        <small>Alex Gaudino</small>
                    </div>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Substitution (feat. Julian Perretta)</div>
                        <small>Purple Disco Machine</small>
                    </div>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Regarde-moi</div>
                        <small>Kungs</small>
                    </div>
                </ListGroup.Item>
            </ListGroup>

            {/* Pop Section */}
            <h5 className="mt-4">Pop</h5>
            <ListGroup variant="flush">
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Irish Pub Song</div>
                        <small>The High Kings</small>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </>
    );
}