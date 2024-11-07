import {
    createContext,
    FC,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
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

    const audioElement = useMemo(() => {
        return document.createElement('audio');
    }, []);

    useEffect(() => {
        // Cleanup function to remove the audio element on unmount
        return () => {
            audioElement.pause();
            audioElement.removeAttribute('src'); // Clear the src to stop loading
            audioElement.load(); // Reset the audio element
        };
    }, [audioElement]);
    
    // Subscription methods (same as before)
    // Subscription methods
    const subscribeToPlay = useCallback((callback: () => void) => {
        onPlaySubscribers.current.push(callback);
        return () => {
            onPlaySubscribers.current = onPlaySubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    }, [onPlaySubscribers]);

    const subscribeToPause = useCallback((callback: () => void) => {
        onPauseSubscribers.current.push(callback);
        return () => {
            onPauseSubscribers.current = onPauseSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    }, [onPauseSubscribers]);

    const subscribeToEnded = useCallback((callback: () => void) => {
        onEndedSubscribers.current.push(callback);
        return () => {
            onEndedSubscribers.current = onEndedSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    }, [onEndedSubscribers]);

    const subscribeToLoadedMetadata = useCallback((callback: () => void) => {
        onLoadedMetadataSubscribers.current.push(callback);
        return () => {
            onLoadedMetadataSubscribers.current = onLoadedMetadataSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    }, [onLoadedMetadataSubscribers]);

    const subscribeToTimeUpdate = useCallback((callback: (currentTime: number) => void) => {
        onTimeUpdateSubscribers.current.push(callback);
        return () => {
            onTimeUpdateSubscribers.current = onTimeUpdateSubscribers.current.filter(
                (cb) => cb !== callback
            );
        };
    }, [onTimeUpdateSubscribers]);

    const setDocumentTitle = useCallback((rzAudio: RZAudio) => {  
        document.title = `${rzAudio.name} - ${rzAudio.author.name}`;
    }, []);

    const setAudio = useCallback(async (rzAudio: RZAudio) => {
        const url = await storageUtils.toDownloadURL(rzAudio.audioUrl);
        audioElement.src = url;
        setRzAudioState(rzAudio);
        setDocumentTitle(rzAudio);
    }, [audioElement, setRzAudioState, setDocumentTitle]);

    const play = useCallback(async (newRzAudio?: RZAudio) => {
         if (newRzAudio) {
            await setAudio(newRzAudio);
        } else if (!rzAudio && rzAudioList.length > 0) {
            await setAudio(rzAudioList[0]);
        }
        audioElement.play();
    }, [rzAudio, rzAudioList, setAudio, audioElement]);

    const pause = useCallback(() => {
        audioElement.pause();
    }, [audioElement]);

    const setCurrentTime = useCallback((time: number) => {
        if (!isNaN(audioElement.duration)) {
            audioElement.currentTime = time;
            setCurrentTimeState(time);
        }
    },[audioElement, setCurrentTimeState]);

    useEffect(() => {
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
            setDuration(audioElement.duration);
            onLoadedMetadataSubscribers.current.forEach((callback) => callback());
        };

        const handleTimeUpdate = () => {
            setCurrentTimeState(audioElement.currentTime);
            onTimeUpdateSubscribers.current.forEach((callback) =>
                callback(audioElement.currentTime)
            );
        };

        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handleEnded);
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audioElement.removeEventListener('play', handlePlay);
            audioElement.removeEventListener('pause', handlePause);
            audioElement.removeEventListener('ended', handleEnded);
            audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [rzAudio, rzAudioList, play, audioElement, setCurrentTimeState, onPlaySubscribers, onPauseSubscribers, onEndedSubscribers, onLoadedMetadataSubscribers, onTimeUpdateSubscribers]);

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
