import React from 'react';
import { Image, ListGroup } from "react-bootstrap";
import { RZAudio, PlayableSorting } from "../data/model";
import { useRecoilValue } from "recoil";
import { audioSortingState, rzAudiosState } from "../state/audio";
import { startTransition, Suspense, useEffect } from "react";
import { useAudio } from "../providers/AudioProvider";

// Static method to bucket playables by date
function bucketByDate(audios: RZAudio[]): Map<string, RZAudio[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const buckets = new Map<string, RZAudio[]>([
        ["Today", []],
        ["Yesterday", []],
        ["Last Week", []],
        ["Last Year", []],
    ]);

    audios.forEach((audio) => {
        const createdAt = new Date(audio.createdAt);

        if (isSameDay(createdAt, today)) {
            buckets.get("Today")!.push(audio);
        } else if (isSameDay(createdAt, yesterday)) {
            buckets.get("Yesterday")!.push(audio);
        } else if (createdAt >= startOfWeek) {
            buckets.get("Last Week")!.push(audio);
        } else if (createdAt >= startOfYear) {
            buckets.get("Last Year")!.push(audio);
        }
    });

    return buckets;
}

function buucketByTopic(playables: RZAudio[]): Map<string, RZAudio[]> {
    const buckets = new Map<string, RZAudio[]>();

    playables.forEach((playable) => {
        playable.topics.forEach((topic) => {
            if (!buckets.has(topic)) {
                buckets.set(topic, []);
            }

            buckets.get(topic)!.push(playable);
        });
    });

    return buckets;
}

function removeEmptyBuckets(map: Map<string, RZAudio[]>): Map<string, RZAudio[]> {
    const filteredMap = new Map<string, RZAudio[]>();

    map.forEach((value, key) => {
        if (value.length > 0) {
            filteredMap.set(key, value);
        }
    });

    return filteredMap;
}


// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

interface PlayableListProps {
  searchString: string|undefined;
  // other props
}

export const AudioList: React.FC<PlayableListProps> = ({ searchString, ...props }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AudioListImpl searchString={searchString} {...props} />
    </Suspense>
  );
};

export default AudioList;

function AudioListImpl({ searchString }: PlayableListProps) {
    const rzAudios = useRecoilValue(rzAudiosState);
    const audioSorting = useRecoilValue(audioSortingState);
    const {rzAudio: currentPlayable} = useAudio();

    const {
        play,
        setRzAudio: setPlayable,
        setRzAudios: setPlayablesList } = useAudio();

    useEffect(() => {
        setPlayablesList(rzAudios);
    }, [rzAudios, setPlayablesList]);

    let bucketedAudioList = (audioSorting === PlayableSorting.Date) ? bucketByDate(rzAudios) : buucketByTopic(rzAudios);
    bucketedAudioList = removeEmptyBuckets(bucketedAudioList);

    function playAudio(audio: RZAudio) {
        startTransition(() => {
            setPlayable(audio);
            play();
        });
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {
                Array.from(bucketedAudioList).map(([name, audios]) => (
                    <div key={name}>
                        <h5 className="mt-4 text-light">{name}</h5>
                        <ListGroup variant="flush" key={name} className="w-100">
                            {audios
                                .filter(rzAudio => {
                                    if (!searchString) {
                                        return true;
                                    }
                                    rzAudio.name.toLowerCase().includes(searchString.toLowerCase())
                                })
                                .map((rzAudio) => (
                                <ListGroup.Item key={rzAudio.id} className={"d-flex align-items-center text-light " + ((currentPlayable && currentPlayable.id === rzAudio.id) ? "bg-secondary rounded" : "bg-dark")} onClick={() => playAudio(rzAudio)}>
                                    <Image src={rzAudio.imageUrl} rounded className="me-3" width={50} height={50} />
                                    <div>
                                        <div>{rzAudio.name}</div>
                                        <small>{rzAudio.channel.name}</small>
                                    </div>
                                </ListGroup.Item>))}

                        </ListGroup>
                    </div>
                ))
            }

        </Suspense>
    );
}