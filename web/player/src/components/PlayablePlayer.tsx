import { useRecoilValue } from 'recoil';
import { currentPlayableState } from '../state/main';
import React, { useRef, useState } from 'react';

import { Button, ButtonGroup, Container, ProgressBar } from 'react-bootstrap';
import { BsFastForwardFill, BsPause, BsPlayFill, BsRewindFill } from 'react-icons/bs';

interface AudioPlayerProps {
  audioSrc: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Container className="audio-player">
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
      />
      <div className="d-flex justify-content-center m-3">
        <ButtonGroup>
          <Button variant="dark" onClick={handleRewind}>
            <BsRewindFill />
          </Button>
          <Button variant="dark" onClick={togglePlayPause}>
            {isPlaying ? (<BsPause/>) : (<BsPlayFill/>)}
          </Button>
          <Button variant="dark" onClick={handleForward}>
            <BsFastForwardFill />
          </Button>
        </ButtonGroup>
      </div>
      <div>
        <ProgressBar now={(currentTime / duration) * 100} variant="info" style={{ height: '5px', marginBottom: '5px' }} />
        <div style={{ color: 'white', fontSize: '12px', textAlign: 'center' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </Container>
  );
};

export function PlayablePlayer() {

  const playingPlayable = useRecoilValue(currentPlayableState);

  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <AudioPlayer audioSrc={playingPlayable?.audioUrl || ""} />
      </React.Suspense>
    </div>
  );
}

