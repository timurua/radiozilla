import { useRecoilValue, useSetRecoilState } from 'recoil';
import { currentPlayableState, playingModeState } from '../state/main';
import React, { useRef, useState } from 'react';

import { Button, ButtonGroup, Container, Image, ProgressBar } from 'react-bootstrap';
import { BsFastForwardFill, BsPause, BsPlayFill, BsRewindFill } from 'react-icons/bs';
import { Playable, PlayingMode } from '../data/model';
import { useAudio } from '../providers/AudioProvider';

interface AudioPlayerProps {
  minimized: boolean;
  navbarHeight: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ minimized, navbarHeight }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playable = useRecoilValue<Playable | null>(currentPlayableState);
  const mode = useRecoilValue(playingModeState);
  const setMode = useSetRecoilState(playingModeState)
  const {
    play,
    pause,
    setSrc,
    isPlaying,
    isPaused,
    hasEnded,
    subscribeToPlay,
    subscribeToPause,
    subscribeToEnded, } = useAudio();

  const minimizedStyle: React.CSSProperties = minimized
    ? {
      position: 'fixed',
      top: navbarHeight,
      width: '100%',
      height: '50px', // Adjust the minimized height as needed
      zIndex: 1000,
      backgroundColor: 'white', // Optional styling
      paddingTop: '40px',
    }
    : {};


  const togglePlayPause = () => {
    if (mode === PlayingMode.Playing) {
      audioRef.current?.pause();
      setMode(PlayingMode.Paused)
    } else {
      audioRef.current?.play();
      setMode(PlayingMode.Playing)
    }
  };

  const handleLoadedMetadata = () => {
    const audioDuration = audioRef.current?.duration || 0;
    setDuration(audioDuration);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current?.currentTime || 0;
    setCurrentTime(current);
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const handleEnd = () => {
    if (audioRef.current) {
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div style={minimizedStyle} className='bg-dark'>
      <Container className="audio-player bg-dark">
        {
          !minimized && playable && mode !== PlayingMode.Idle ? (
            <div className="d-flex align-items-center text-light bg-dark">
              <Image src={playable.imageUrl} rounded className="me-3" width={50}
                height={50} />
              <div>
                <div>{playable.name}</div>
                <small>{playable.writer}</small>
              </div>
            </div>) : null
        }
        <div className="d-flex justify-content-center m-3">
          <ButtonGroup>
            <Button variant="dark" onClick={handleRewind}>
              <BsRewindFill size={minimized ? 20 : 30} />
            </Button>
            <Button variant="dark" onClick={togglePlayPause}>
              {mode === PlayingMode.Playing ? (<BsPause size={minimized ? 30 : 60} />) : (<BsPlayFill size={minimized ? 30 : 60} />)}
            </Button>
            <Button variant="dark" onClick={handleForward}>
              <BsFastForwardFill size={minimized ? 20 : 30} />
            </Button>
          </ButtonGroup>
        </div>
        <div>
          <ProgressBar now={(currentTime / duration) * 100} variant="info" style={{ height: '5px', marginBottom: '5px' }} />
          {
            minimized ? null : <div style={{ color: 'white', fontSize: '12px', textAlign: 'center' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          }
        </div>
      </Container>
    </div>
  );
};

export const PlayablePlayer: React.FC<AudioPlayerProps> = ({ minimized, navbarHeight }) => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AudioPlayer minimized={minimized} navbarHeight={navbarHeight} />
    </React.Suspense>
  )
}

