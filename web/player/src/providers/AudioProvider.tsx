import {
    createContext,
    useRef,
    useState,
    useEffect,
    ReactNode,
    useContext,
    FC,
} from 'react';
import { RZAudio } from '../data/model';
import { storageUtils } from '../firebase';

interface AudioContextProps {
    play: (audio?: RZAudio) => Promise<void>;
    pause: () => void;
    rzAudio: RZAudio|null;
    setRzAudio: (rzAudio: RZAudio|null) => void;
    rzAudios: RZAudio[];
    setRzAudios: (audios: RZAudio[]) => void;
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

export const AudioProvider: FC<AudioProviderProps> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [hasEnded, setHasEnded] = useState<boolean>(false);
    const [currentTimeState, setCurrentTimeState] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [rzAudio, setRzAudioState] = useState<RZAudio|null>(null);
    const [rzAudioList, setRzAudioList] = useState<RZAudio[]>([]);

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

        const handleEnded = async() => {
            setIsPlaying(false);
            setIsPaused(false);
            setHasEnded(true);
            onEndedSubscribers.current.forEach((callback) => callback());
            if (rzAudio){
                const index = rzAudioList.indexOf(rzAudio);
                if (index < rzAudioList.length - 1){
                    await play(rzAudioList[index + 1]);
                }
            } else if(rzAudioList.length > 0){
                await play(rzAudioList[0]);
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
    }, [rzAudio, rzAudioList]);

    const play = async (newRzAudio?: RZAudio) => {

        const audio = audioRef.current;
        if (!audio) return;

        if (newRzAudio) {
            await setAudio(newRzAudio);
        } else if (!rzAudio && rzAudioList.length > 0) {
            await setAudio(rzAudioList[0]);
        }
        audio.play();
    };

    const pause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
    };

    const setAudio = async (rzAudio: RZAudio) => {
        const audio = audioRef.current;
        if (!audio) return;

        const url = await storageUtils.getDownloadURL(rzAudio.audioUrl);
        audio.src = url;
        setRzAudioState(rzAudio);
        setDocumentTitle(rzAudio);
    };

    const setDocumentTitle = (rzAudio: RZAudio) => {  
        document.title = `${rzAudio.name} - ${rzAudio.author.name}`;
    }

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
                rzAudio: rzAudio,
                setRzAudio: setRzAudioState,
                rzAudios: rzAudioList,
                setRzAudios: setRzAudioList,
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
