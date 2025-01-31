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
import logger from '../utils/logger';
import { useAuth } from '../providers/AuthProvider';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userDataState } from '../state/userData';

interface AudioContextProps {
    play: (audio?: RZAudio) => Promise<void>;
    pause: () => void;
    rzAudio: RZAudio | null;
    setRzAudio: (rzAudio: RZAudio | null) => void;
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

// Error message mapping type
type ErrorMessageMap = {
    [key in 'MEDIA_ERR_ABORTED' |
    'MEDIA_ERR_NETWORK' |
    'MEDIA_ERR_DECODE' |
    'MEDIA_ERR_SRC_NOT_SUPPORTED' |
    'PLAYBACK_ERROR' |
    'PERMISSION_ERROR' |
    'UNKNOWN_ERROR']: string;
};

// Error message mapping
const errorMessages: ErrorMessageMap = {
    MEDIA_ERR_ABORTED: 'Playback was aborted by the user',
    MEDIA_ERR_NETWORK: 'A network error occurred while loading the audio',
    MEDIA_ERR_DECODE: 'The audio file is corrupted or unsupported',
    MEDIA_ERR_SRC_NOT_SUPPORTED: 'The audio format is not supported by your browser',
    PLAYBACK_ERROR: 'Failed to play the audio',
    PERMISSION_ERROR: 'Browser denied audio playback. Please check your permissions',
    UNKNOWN_ERROR: 'An unknown error occurred'
};

export const AudioProvider: FC<AudioProviderProps> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [hasEnded, setHasEnded] = useState<boolean>(false);
    const [currentTimeState, setCurrentTimeState] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [rzAudio, setRzAudioState] = useState<RZAudio | null>(null);
    const [rzAudioList, setRzAudioList] = useState<RZAudio[]>([]);
    const userData = useRecoilValue(userDataState);
    const setUserData = useSetRecoilState(userDataState);

    // Subscription arrays and methods
    const onPlaySubscribers = useRef<Array<() => void>>([]);
    const onPauseSubscribers = useRef<Array<() => void>>([]);
    const onEndedSubscribers = useRef<Array<() => void>>([]);
    const onLoadedMetadataSubscribers = useRef<Array<() => void>>([]);
    const onTimeUpdateSubscribers = useRef<Array<(currentTime: number) => void>>([]);

    const [reportedMinute, setReportedMinute] = useState<number>(-1);

    const audioElement = useMemo(() => {
        return document.createElement('audio');
    }, []);

    const reportPlayback = async () => {
        const userId = user?.id;
        if (rzAudio && isPlaying && userId && reportedMinute >= 0) {
            const newUserData = userData.clone();            
            newUserData.playedAudioIds = Array.from(new Set([...newUserData.playedAudioIds, rzAudio.id]));
            setUserData(newUserData);            
        }
    }

    useEffect(() => {
        reportPlayback();
    }, [rzAudio, reportedMinute, isPlaying]);

    const {user} = useAuth();

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
        if ('mediaSession' in navigator && rzAudio) {
            navigator.mediaSession.metadata = new MediaMetadata({
            title: rzAudio.name,
            artist: rzAudio.author.name,
            album: rzAudio.channel.name,
            artwork: [
                {
                src: rzAudio.imageUrl || rzAudio.channel.imageUrl || rzAudio.author.imageUrl,
                sizes: '512x512',
                }
            ]
            });
        }
    }, [rzAudio, rzAudioList, setAudio, audioElement]);

    const pause = useCallback(() => {
        audioElement.pause();
    }, [audioElement]);

    const setCurrentTime = useCallback((time: number) => {
        if (!isNaN(audioElement.duration)) {
            audioElement.currentTime = time;
            setCurrentTimeState(time);
        }
    }, [audioElement, setCurrentTimeState]);

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

        const handleEnded = async () => {
            setIsPlaying(false);
            setIsPaused(false);
            setHasEnded(true);
            onEndedSubscribers.current.forEach((callback) => callback());
            if (rzAudio) {
                const index = rzAudioList.indexOf(rzAudio);
                if (index < rzAudioList.length - 1) {
                    await play(rzAudioList[index + 1]);
                }
            } else if (rzAudioList.length > 0) {
                await play(rzAudioList[0]);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audioElement.duration);
            onLoadedMetadataSubscribers.current.forEach((callback) => callback());
        };

        const handleTimeUpdate = () => {
            setCurrentTimeState(audioElement.currentTime);
            setReportedMinute(Math.floor((audioElement.currentTime - 15) / 60));
            onTimeUpdateSubscribers.current.forEach((callback) =>
                callback(audioElement.currentTime)
            );
        };

        const handleError = (error: Event | Error | unknown) => {
            let errorMessage: string;

            // Handle error event from audio element
            if (error instanceof Event && error.type === 'error' && audioElement?.error) {
                const mediaError = audioElement.error;

                switch (mediaError.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMessage = `${errorMessages.MEDIA_ERR_ABORTED} (Code: ${mediaError.code}). Message: ${mediaError.message}`;
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMessage = `${errorMessages.MEDIA_ERR_NETWORK} (Code: ${mediaError.code}). Message: ${mediaError.message}`;
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMessage = `${errorMessages.MEDIA_ERR_DECODE} (Code: ${mediaError.code}). Message: ${mediaError.message}`;
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = `${errorMessages.MEDIA_ERR_SRC_NOT_SUPPORTED} (Code: ${mediaError.code}). Message: ${mediaError.message}`;
                        break;
                    default:
                        errorMessage = `${errorMessages.UNKNOWN_ERROR} (Code: ${mediaError.code}). Message: ${mediaError.message}`;
                }
            }
            // Handle DOMException errors
            else if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError') {
                    errorMessage = `${errorMessages.PERMISSION_ERROR}. Details: ${error.message}`;
                } else {
                    errorMessage = `${errorMessages.PLAYBACK_ERROR}. Details: ${error.message}`;
                }
            }
            // Handle other Error types
            else if (error instanceof Error) {
                errorMessage = `${errorMessages.UNKNOWN_ERROR}. Details: ${error.message}`;
            }
            // Handle unknown error types
            else {
                errorMessage = errorMessages.UNKNOWN_ERROR;
            }
            logger.error(`Error loading audio: ${errorMessage}`);
        };

        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handleEnded);
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.addEventListener('timeupdate', handleTimeUpdate);
        audioElement.addEventListener('error', handleError);

        return () => {
            audioElement.removeEventListener('play', handlePlay);
            audioElement.removeEventListener('pause', handlePause);
            audioElement.removeEventListener('ended', handleEnded);
            audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.removeEventListener('timeupdate', handleTimeUpdate);
            audioElement.removeEventListener('error', handleError);
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
