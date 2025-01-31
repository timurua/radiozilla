import { Button, ButtonGroup } from "react-bootstrap";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { PlayableFeedMode } from "../data/model";
import { audioRetrivalState } from "../state/audio";


export function PlayableSortingSelector() {
    const sortings = Object.values(PlayableFeedMode).filter(value => typeof value === 'string');

    const playableRetrieval = useRecoilValue(audioRetrivalState);
    const setPlayableSorting = useSetRecoilState(audioRetrivalState);

    function setSorting(sorting: string) {
        // @ts-ignore
        var newSorting: PlayableFeedMode | null = PlayableFeedMode[sorting as keyof typeof PlayableFeedMode]
        if(newSorting === playableRetrieval.mode) {
            newSorting = null;
        }
        setPlayableSorting({
            mode: newSorting
        });
    }


    return (
        
        <ButtonGroup className="text-center mb-4 pt-4 d-flex justify-content-center">
            {sortings.map((sorting) => (
                <Button key={sorting} variant={playableRetrieval.mode === sorting ? "outline-light active" : "outline-light"} size="sm" onClick={() => setSorting(sorting)}>{sorting}</Button>
            ))}
        </ButtonGroup>
    );
}