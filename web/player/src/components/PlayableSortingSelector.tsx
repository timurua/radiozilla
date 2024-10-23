import { Button, Row, Col } from "react-bootstrap";
import { PlayableSorting } from "../data/model"
import { playableSortingState } from "../state/main";
import { useRecoilValue, useSetRecoilState } from "recoil";


export function PlayableSortingSelector() {
    const sortings = Object.values(PlayableSorting).filter(value => typeof value === 'string');

    const playableSorting = useRecoilValue(playableSortingState);
    const setPlayableSorting = useSetRecoilState(playableSortingState);

    function setSorting(sorting: string) {
        setPlayableSorting(PlayableSorting[sorting as keyof typeof PlayableSorting])
    }


    return (
        <Row className="text-center mb-4 pt-4">
            {sortings.map((sorting) => (
                <Col key={sorting}>
                    <Button variant={playableSorting === sorting ? "outline-light active" : "outline-light"} size="sm" onClick={()=> setSorting(sorting)}>{sorting}</Button>
                </Col>
            ))}
        </Row>
    );
}