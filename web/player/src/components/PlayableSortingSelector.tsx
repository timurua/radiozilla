import { Button, Row, Col } from "react-bootstrap";
import { PlayableSorting } from "../data/model"


export function PlayableSortingSelector() {
    const sortings = Object.values(PlayableSorting).filter(value => typeof value === 'string');
    return (
        <Row className="text-center mb-4">
            {sortings.map((sorting) => (
                <Col>
                    <Button variant="outline-light" size="sm">{sorting}</Button>
                </Col>
            ))}
        </Row>
    );
}