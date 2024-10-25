import React, {
    createContext,
    useRef,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from 'react';
import { Playable } from '../data/model';

interface AudioContextProps {
    play: (url?: string) => void;
    pause: () => void;
    playable: Playable|null;
    setPlayable: (playable: Playable|null) => void;
    playablesList: Playable[];
    setPlayablesList: (playablesList: Playable[]) => void;
    setCurrentTime: (time: number) => void;
    isPlaying: boolean;
    isPaused: boolean;
    hasEnded: boolean;
    currentTime: number;
    duration: number;
    subscribeToPlay: (callback: () => void) => () => void;
    subscribeToPause: (callback: () => void) => () => void;
    subscribeToEnded: (callback: () => void) => () => void;
    subscribeToLoadedMetadata: (callback: () => void) => () => void;
    subscribeToTimeUpdate: (callback: (currentTime: number) => void) => () => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

interface AudioProviderProps {
    children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [hasEnded, setHasEnded] = useState<boolean>(false);
    const [currentTimeState, setCurrentTimeState] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [playable, setPlayableState] = useState<Playable|null>(null);
    const [playablesList, setPlayablesList] = useState<Playable[]>([]);

    // Subscription arrays and methods
    const onPlaySubscribers = useRef<Array<() => void>>([]);
    const onPauseSubscribers = useRef<Array<() => void>>([]);
    const onEndedSubscribers = useRef<Array<() => void>>([]);
    const onLoadedMetadataSubscribers = useRef<Array<() => void>>([]);
    const onTimeUpdateSubscribers = useRef<Array<(currentTime: number) => void>>([]);

    // Subscription methods (same as before)
    // Subscription methods
    const subscribeToPlay = (callback: () => void) => {
        onPlaySubscribers.current.push(callback);
        return () => {
            onPlaySubscribers.current = onPlaySubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    };

    const subscribeToPause = (callback: () => void) => {
        onPauseSubscribers.current.push(callback);
        return () => {
            onPauseSubscribers.current = onPauseSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    };

    const subscribeToEnded = (callback: () => void) => {
        onEndedSubscribers.current.push(callback);
        return () => {
            onEndedSubscribers.current = onEndedSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    };

    const subscribeToLoadedMetadata = (callback: () => void) => {
        onLoadedMetadataSubscribers.current.push(callback);
        return () => {
            onLoadedMetadataSubscribers.current = onLoadedMetadataSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    };

    const subscribeToTimeUpdate = (callback: (currentTime: number) => void) => {
        onTimeUpdateSubscribers.current.push(callback);
        return () => {
            onTimeUpdateSubscribers.current = onTimeUpdateSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    };


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            setIsPlaying(true);
            setIsPaused(false);
            setHasEnded(false);
            onPlaySubscribers.current.forEach((callback) => callback());
        };

        const handlePause = () => {
            setIsPlaying(false);
            setIsPaused(true);
            onPauseSubscribers.current.forEach((callback) => callback());
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setHasEnded(true);
            onEndedSubscribers.current.forEach((callback) => callback());
            if (playable){
                const index = playablesList.indexOf(playable);
                if (index < playablesList.length - 1){
                    setPlayable(playablesList[index + 1]);
                }
            } else if(playablesList.length > 0){
                setPlayable(playablesList[0]);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            onLoadedMetadataSubscribers.current.forEach((callback) => callback());
        };

        const handleTimeUpdate = () => {
            setCurrentTimeState(audio.currentTime);
            onTimeUpdateSubscribers.current.forEach((callback) =>
                callback(audio.currentTime)
            );
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const play = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playable) {
            if (audio.src !== playable.audioUrl) {
                audio.src = playable.audioUrl;
            }
        } else if (playablesList.length > 0) {
            setPlayable(playablesList[0]);
        }
        audio.play();
    };

    const pause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
    };

    const setPlayable = (playable: Playable) => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.src = playable.audioUrl;
    };

    const setCurrentTime = (time: number) => {
        const audio = audioRef.current;
        if (audio && !isNaN(audio.duration)) {
            audio.currentTime = time;
            setCurrentTimeState(time);
        }
    };

    return (
        <AudioContext.Provider
            value={{
                play,
                pause,
                playable,
                setPlayable: setPlayableState,
                playablesList,
                setPlayablesList,
                setCurrentTime,
                isPlaying,
                isPaused,
                hasEnded,
                currentTime: currentTimeState,
                duration,
                subscribeToPlay,
                subscribeToPause,
                subscribeToEnded,
                subscribeToLoadedMetadata,
                subscribeToTimeUpdate,
            }}
        >
            {children}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </AudioContext.Provider>
    );
};

export default AudioContext;


export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
