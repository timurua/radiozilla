import React from 'react';

import { Button, ButtonGroup, ProgressBar } from 'react-bootstrap';
import { BsFastForwardFill, BsPause, BsPlayFill, BsRewindFill } from 'react-icons/bs';
import { useAudio } from '../providers/AudioProvider';

function SmallAudioPlayerImpl(){
  const {
    play,
    pause,
    isPlaying,
    currentTime,
    duration,
    setCurrentTime } = useAudio();

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleRewind = () => {
    if (currentTime) {
      setCurrentTime(Math.max(0, currentTime - 10));
    }
  };

  const handleForward = () => {
    if (currentTime) {
      setCurrentTime(Math.min(duration, currentTime + 10));
    }
  };

  return (
    <div className='bg-dark pt-3 pb-1'>
        <div className="d-flex justify-content-center">
          <ButtonGroup>
            <Button variant="dark" onClick={handleRewind}>
              <BsRewindFill size={20} />
            </Button>
            <Button variant="dark" onClick={togglePlayPause}>
              {isPlaying ? (<BsPause size={30} />) : (<BsPlayFill size={30} />)}
            </Button>
            <Button variant="dark" onClick={handleForward}>
              <BsFastForwardFill size={20} />
            </Button>
          </ButtonGroup>
        </div>
        <div>
          <ProgressBar now={(currentTime / duration) * 100} variant="info" style={{ height: '5px', marginBottom: '5px' }} />
        </div>
    </div>
  );
};

export function SmallAudioPlayer() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <SmallAudioPlayerImpl/>
    </React.Suspense>
  )
}

