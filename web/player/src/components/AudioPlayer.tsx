import { Suspense, useEffect, useState } from 'react';

import { Button, ButtonGroup, Container, Image, ProgressBar } from 'react-bootstrap';
import { BsFastForwardFill, BsPause, BsPlayFill, BsRewindFill } from 'react-icons/bs';
import { useAudio } from '../providers/AudioProvider';
import { storageUtils } from '../firebase';

function AudioPlayerImpl() {
  const {
    play,
    pause,
    rzAudio: playable,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    setCurrentTime } = useAudio();

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (playable) {
          const url = await storageUtils.getDownloadURL(playable.imageUrl);
          setImageUrl(url);
        } else {
          setImageUrl(undefined);
        }
      } catch (error) {
        console.error('Error fetching image URL from Firebase Storage:', error);
      }
    };

    fetchImage();
  }, [playable]);

  return (
    <div className='bg-dark'>
      <Container className="audio-player bg-dark">
        {
          playable && (isPlaying || isPaused) ? (
            <div className="d-flex align-items-center text-light bg-dark">
              <Image src={imageUrl} rounded className="me-3" width={50}
                height={50} />
              <div>
                <div>{playable.name}</div>
                <small>{playable.author.name}</small>
              </div>
            </div>) : null
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
    </div>
  );
};

export function AudioPlayer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AudioPlayerImpl />
    </Suspense>
  )
}

