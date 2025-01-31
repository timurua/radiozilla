import { Button, ButtonGroup } from "react-bootstrap";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { PlayableFeedMode } from "../data/model";
import { audioRetrivalState } from "../state/audio";


export function PlayableModeSelector() {
    const modes = Object.values(PlayableFeedMode).filter(value => typeof value === 'string');

    const playableRetrieval = useRecoilValue(audioRetrivalState);
    const setPlayableSorting = useSetRecoilState(audioRetrivalState);

    function setSorting(sorting: string) {
        // @ts-ignore
        let newMode: PlayableFeedMode | null = PlayableFeedMode[sorting as keyof typeof PlayableFeedMode]
        if(newMode === playableRetrieval.mode) {
            newMode = null;
        }
        setPlayableSorting({
            mode: newMode
        });
    }


    return (
        
        <ButtonGroup className="text-center mb-4 d-flex justify-content-center">
            {modes.map((sorting) => (
                <Button key={sorting} variant={playableRetrieval.mode === sorting ? "outline-light active" : "outline-light"} size="sm" onClick={() => setSorting(sorting)}>{sorting}</Button>
            ))}
        </ButtonGroup>
    );
}