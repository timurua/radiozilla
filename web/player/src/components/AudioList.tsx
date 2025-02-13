import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ListGroup } from "react-bootstrap";
import { RZAudio } from "../data/model";
import { AudioListItem } from './AudioListItem';
import { SuspenseLoading } from './SuspenseLoading';
import AudioLoader from '../utils/AudioLoader';
import { useAudio } from '../providers/AudioProvider';

// Static method to bucket playables by date
function bucketByDate(audios: RZAudio[]): Map<string, RZAudio[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today);
    startOfMonth.setDate(today.getDate() - 30);

    const startOfYear = new Date(today);
    startOfYear.setDate(today.getDate() - 365);

    const buckets = new Map<string, RZAudio[]>([
        ["Today", []],
        ["Yesterday", []],
        ["Last Week", []],
        ["Last Month", []],
        ["Last Year", []],
        ["All", []],
    ]);

    audios.forEach((audio) => {
        const publishedAt = audio.publishedAt !== null ? new Date(audio.publishedAt) : new Date(0);
        if (isSameDay(publishedAt, today)) {
            buckets.get("Today")!.push(audio);
        } else if (isSameDay(publishedAt, yesterday)) {
            buckets.get("Yesterday")!.push(audio);
        } else if (publishedAt >= startOfWeek) {
            buckets.get("Last Week")!.push(audio);
        } else if (publishedAt >= startOfMonth) {
            buckets.get("Last Month")!.push(audio);
        } else if (publishedAt >= startOfYear) {
            buckets.get("Last Year")!.push(audio);
        } else {
            buckets.get("All")!.push(audio);
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

export function AudioList({ audioLoader, showDates = true }: { audioLoader: AudioLoader, showDates?: boolean }) {
    return (
        <Suspense fallback={<SuspenseLoading />}>
            <AudioListImpl audioLoader={audioLoader} showDates={showDates} />
        </Suspense>
    );
};

export default AudioList;

function AudioListImpl({ audioLoader, showDates = true }: { audioLoader: AudioLoader, showDates: boolean }) {

    const [rzAudios, setRzAudios] = useState<RZAudio[]>(audioLoader.getAudios());
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const { setAudioLoader } = useAudio();
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

    const onClick = () => {
        setAudioLoader(audioLoader);
    }

    const bucketedAudioList = useMemo(() => {
        const bucketedAudioList = bucketByDate(rzAudios)
        return removeEmptyBuckets(bucketedAudioList);
    }, [rzAudios]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {
                showDates ?
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
                    : <>
                        <ListGroup variant="flush" className="w-100 mt-4">
                            {rzAudios
                                .map((rzAudio) => (
                                    <AudioListItem rzAudio={rzAudio} onClick={onClick} key={rzAudio.id} />
                                ))
                            }
                        </ListGroup>
                    </>
            }
            <div
                ref={loadingRef}
                className="h-10 flex items-center justify-center"
            >
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent" />
                {isComplete && (
                    <div className="text-gray-500"></div>
                )}
            </div>
        </Suspense>
    );

}