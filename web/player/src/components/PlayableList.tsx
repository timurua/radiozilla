import { Image, ListGroup } from "react-bootstrap";
import { Playable } from "../data/model";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentPlayableSortingState, currentPlayablesState, currentPlayingPlayableIDState, currentPlayingPlayableState } from "../state/main";

// Static method to bucket playables by date
function bucketByDate(playables: Playable[]): Map<string, Playable[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const buckets = new Map<string, Playable[]>([
        ["Today", []],
        ["Yesterday", []],
        ["LastWeek", []],
        ["LastYear", []],
    ]);

    playables.forEach((playable) => {
        const createdAt = new Date(playable.createdAt);

        if (isSameDay(createdAt, today)) {
            buckets.get("Today")!.push(playable);
        } else if (isSameDay(createdAt, yesterday)) {
            buckets.get("Yesterday")!.push(playable);
        } else if (createdAt >= startOfWeek) {
            buckets.get("LastWeek")!.push(playable);
        } else if (createdAt >= startOfYear) {
            buckets.get("LastYear")!.push(playable);
        }
    });

    return buckets;
}


// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function PlayableList() {
    const currentPlayableList = useRecoilValue(currentPlayablesState);
    const currentPlayableSorting = useRecoilValue(currentPlayableSortingState);
    const currentPlayingPlayable = useRecoilValue(currentPlayingPlayableState);
    const setCurrentPlayingPlayableID = useSetRecoilState(currentPlayingPlayableIDState);

    const bucketedPlayableList = bucketByDate(currentPlayableList);

    return (
        <>
            {
                Array.from(bucketedPlayableList).map(([name, playables]) => (
                    <>
                        <h5 className="mt-4">{name}</h5>
                        <ListGroup variant="flush" key={name} className="w-100">
                            {playables.map((playable) => (
                                <ListGroup.Item key={playable.id} className="d-flex align-items-center text-light bg-dark" onClick={() => setCurrentPlayingPlayableID(playable.id)}>
                                    <Image src={playable.imageUrl} rounded className="me-3" width={50}
                                        height={50} />
                                    <div>
                                        <div>{playable.name}</div>
                                        <small>{playable.writer}</small>
                                    </div>
                                </ListGroup.Item>))}

                        </ListGroup>
                    </>
                ))
            }

        </>
    );
}