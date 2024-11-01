import { Button, ButtonGroup } from "react-bootstrap";
import { PlayableSorting } from "../data/model"
import { audioSortingState } from "../state/audio";
import { useRecoilValue, useSetRecoilState } from "recoil";


export function PlayableSortingSelector() {
    const sortings = Object.values(PlayableSorting).filter(value => typeof value === 'string');

    const playableSorting = useRecoilValue(audioSortingState);
    const setPlayableSorting = useSetRecoilState(audioSortingState);

    function setSorting(sorting: string) {
        setPlayableSorting(PlayableSorting[sorting as keyof typeof PlayableSorting])
    }


    return (
        
        <ButtonGroup className="text-center mb-4 pt-4 d-flex justify-content-center">
            {sortings.map((sorting) => (
                <Button key={sorting} variant={playableSorting === sorting ? "outline-light active" : "outline-light"} size="sm" onClick={() => setSorting(sorting)}>{sorting}</Button>
            ))}
        </ButtonGroup>
    );
}