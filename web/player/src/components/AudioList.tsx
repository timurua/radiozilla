import React, { Suspense, useEffect, useState } from 'react';
import { Image, ListGroup } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { PlayableSorting, RZAudio } from "../data/model";
import { storageUtils } from '../firebase';
import { useAudio } from "../providers/AudioProvider";
import { audioSortingState, rzAudiosState } from "../state/audio";
import logger from '../utils/logger';
import { useNavigate } from 'react-router-dom';

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
    searchString: string | undefined;
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

function AudioListItem({ rzAudio }: { rzAudio: RZAudio }) {
    const { rzAudio: currentPlayable } = useAudio();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const { play } = useAudio();
    
    function playAudio(audio: RZAudio) {
        play(audio);
    }

    function openAudio(audio: RZAudio) {
        navigate(`/audio/${audio.id}`);
    }

    function onAudioClick(isPlaying: boolean, rzAudio: RZAudio) {
        if (isPlaying) {
            openAudio(rzAudio);
        } else {
            playAudio(rzAudio);
        }
    }

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const url = await storageUtils.toDownloadURL(rzAudio.imageUrl);
                setImageUrl(url);
            } catch (error) {
                logger.error('Error fetching image URL from Firebase Storage:', error);
            }
        };

        fetchImage();
    }, [rzAudio?.imageUrl, setImageUrl]);

    const isPlaying = !!(currentPlayable && currentPlayable.id === rzAudio.id);

    return (
        <ListGroup.Item key={rzAudio.id} className={"no-select d-flex align-items-center text-light " + (isPlaying ? "bg-secondary rounded" : "bg-dark")} onClick={() => onAudioClick(isPlaying, rzAudio)}>
            <Image src={imageUrl} rounded className="me-3 text-light" width={50} height={50} />
            <div>
                <div>{rzAudio.name}</div>
                <small>{rzAudio.channel.name}</small>
            </div>
        </ListGroup.Item>);
}

function AudioListImpl({ searchString }: PlayableListProps) {
    const rzAudios = useRecoilValue(rzAudiosState);
    const audioSorting = useRecoilValue(audioSortingState);

    const {
        setRzAudios: setPlayablesList } = useAudio();

    useEffect(() => {
        setPlayablesList(rzAudios);
    }, [rzAudios, setPlayablesList]);

    let bucketedAudioList = (audioSorting === PlayableSorting.Date) ? bucketByDate(rzAudios) : buucketByTopic(rzAudios);
    bucketedAudioList = removeEmptyBuckets(bucketedAudioList);

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
                                    <AudioListItem rzAudio={rzAudio} key={rzAudio.id} />
                                ))
                            }
                        </ListGroup>
                    </div>
                ))
            }

        </Suspense>
    );
}