import { Button, Row, Col } from "react-bootstrap";
import { PlayableSorting } from "../data/model"
import { currentPlayableSortingState } from "../state/main";
import { useRecoilValue, useSetRecoilState } from "recoil";


export function PlayableSortingSelector() {
    const sortings = Object.values(PlayableSorting).filter(value => typeof value === 'string');

    const currentPlayableSorting = useRecoilValue(currentPlayableSortingState);
    const setCurrentPlayableSorting = useSetRecoilState(currentPlayableSortingState);

    function setSorting(sorting: string) {
        setCurrentPlayableSorting(PlayableSorting[sorting as keyof typeof PlayableSorting])
    }


    return (
        <Row className="text-center mb-4">
            {sortings.map((sorting) => (
                <Col>
                    <Button variant="outline-light" size="sm" onClick={()=> setSorting(sorting)}>{sorting}</Button>
                </Col>
            ))}
        </Row>
    );
}