import { Suspense, useEffect, useState } from 'react';

import { Button, ButtonGroup, Container, Image, ProgressBar } from 'react-bootstrap';
import { BsFastForwardFill, BsPause, BsPlayFill, BsRewindFill } from 'react-icons/bs';
import { useAudio } from '../providers/AudioProvider';
import { storageUtils } from '../firebase';
import logger from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import BootstrapMarkdown from './Markdown';

function AudioPlayerImpl({ showExtendedInfo = false }: { showExtendedInfo?: boolean }) {
  const {
    play,
    pause,
    rzAudio,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    setCurrentTime
  } = useAudio();

  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const onTextClick = () => {
    if (isPlaying) {
      
      navigate(`/audio/${rzAudio?.id}`);
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
        if (rzAudio) {
          const url = await storageUtils.toDownloadURL(rzAudio.imageUrl);
          setImageUrl(url);
        } else {
          setImageUrl(undefined);
        }
      } catch (error) {
        logger.error('Error fetching image URL from Firebase Storage:', error);
      }
    };

    fetchImage();
  }, [rzAudio, rzAudio?.imageUrl, setImageUrl]);

  return (
    <div className='bg-dark'>
      <Container className="audio-player bg-dark">
        {rzAudio && (isPlaying || isPaused) ? (
          <div className="d-flex align-items-center text-light bg-dark" onClick={onTextClick}>
            <Image src={imageUrl} rounded className="me-3" width={50} height={50} />
            <div>
              <div>{rzAudio.name}</div>
              <small>{rzAudio.author.name}</small>
            </div>
          </div>
        ) : null}
        <div className="d-flex justify-content-center m-3">
          <ButtonGroup>
            <Button variant="dark" onClick={handleRewind}>
              <BsRewindFill size={30} />
            </Button>
            <Button variant="dark" onClick={togglePlayPause}>
              {isPlaying ? <BsPause size={60} /> : <BsPlayFill size={60} />}
            </Button>
            <Button variant="dark" onClick={handleForward}>
              <BsFastForwardFill size={30} />
            </Button>
          </ButtonGroup>
        </div>
        <div>
          <ProgressBar
            now={(currentTime / duration) * 100}
            variant="info"
            style={{ height: '5px', marginBottom: '5px' }}
          />
          <div style={{ color: 'white', fontSize: '12px', textAlign: 'center' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        {showExtendedInfo && rzAudio && (
        <div className='text-light p-2'>
          <BootstrapMarkdown markdownContent={rzAudio.audioText}/>
          <div>
            <a
              href={`${rzAudio?.webUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-light"
            >
              Visit the website
            </a>
          </div>
        </div>
        )}
      </Container>
    </div>
  );
};

export function AudioPlayer({ showExtendedInfo = false }: { showExtendedInfo?: boolean }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AudioPlayerImpl showExtendedInfo={showExtendedInfo} />
    </Suspense>
  )
}

