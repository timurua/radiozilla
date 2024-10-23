import { useRecoilValue } from 'recoil';
import { currentPlayableState } from '../state/main';
import React, { useRef, useState } from 'react';

import { Button, ButtonGroup, Container, Image, ProgressBar } from 'react-bootstrap';
import { BsFastForwardFill, BsPause, BsPlayFill, BsRewindFill } from 'react-icons/bs';
import { Playable } from '../data/model';

interface AudioPlayerProps {
  playable: Playable | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ playable }) => {
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
        src={playable?.audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
      />
      {
        !playable ? null : (
          <div className="d-flex align-items-center text-light bg-dark">
            <Image src={playable.imageUrl} rounded className="me-3" width={50}
              height={50} />
            <div>
              <div>{playable.name}</div>
              <small>{playable.writer}</small>
            </div>
          </div>)
      }
      <div className="d-flex justify-content-center m-3">
        <ButtonGroup>
          <Button variant="dark" onClick={handleRewind}>
            <BsRewindFill size={30} />
          </Button>
          <Button variant="dark" onClick={togglePlayPause}>
            {isPlaying ? (<BsPause size={60} />) : (<BsPlayFill size={60} />)}
          </Button>
          <Button variant="dark" onClick={handleForward}>
            <BsFastForwardFill size={30} />
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

  const playable = useRecoilValue(currentPlayableState);

  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <AudioPlayer playable={playable} />
      </React.Suspense>
    </div>
  );
}

