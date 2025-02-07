import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ListGroup } from "react-bootstrap";
import { RZAudio } from "../data/model";
import { AudioListItem } from './AudioListItem';
import { SuspenseLoading } from './SuspenseLoading';
import AudioLoader from '../utils/AudioLoader';

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

export function AudioList({ audioLoader }: { audioLoader: AudioLoader }) {
    return (
        <Suspense fallback={<SuspenseLoading />}>
            <AudioListImpl audioLoader={audioLoader}/>
        </Suspense>
    );
};

export default AudioList;

function AudioListImpl({ audioLoader, onClick }: { audioLoader: AudioLoader, onClick?: (audio: RZAudio) => void }) {

    const [rzAudios, setRzAudios] = useState<RZAudio[]>(audioLoader.getAudios());
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const subscriber = () => {
            setRzAudios([...audioLoader.getAudios()]);
            setIsComplete(audioLoader.isComplete());
        };
        if (audioLoader.getAudios().length === 0 && !audioLoader.isComplete()) {
            audioLoader.getNextAudioPage();
        }
        const unsubscribe = audioLoader.subscribe(subscriber);
        return unsubscribe;
    }, [audioLoader]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {                
                if (entries[0].isIntersecting) {
                    audioLoader.getNextAudioPage();
                }
            },
            { threshold: 0.1 }
        );

        observerRef.current = observer;

        if (loadingRef.current) {
            observer.observe(loadingRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [audioLoader, observerRef, loadingRef]);

    
    const bucketedAudioList = useMemo(()=> {
        let bucketedAudioList = bucketByDate(rzAudios)
        removeEmptyBuckets(bucketedAudioList);
        return bucketedAudioList;
    }, [rzAudios]);
   
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {
                Array.from(bucketedAudioList).map(([name, audios]) => (
                    <div key={name}>
                        <h5 className="mt-4 text-light">{name}</h5>
                        <ListGroup variant="flush" key={name} className="w-100">
                            {audios
                                .map((rzAudio) => (
                                    <AudioListItem rzAudio={rzAudio} onClick={onClick} key={rzAudio.id} />
                                ))
                            }
                        </ListGroup>
                    </div>
                ))
            }
            <div 
                ref={loadingRef} 
                className="h-10 flex items-center justify-center"
            >
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent" />
                {isComplete && (
                    <div className="text-gray-500">No more items to load</div>
                )}
            </div>
        </Suspense>
    );
}