'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { storageUtils } from '../../../lib/firebase';

import { Button, ButtonGroup, Image, ProgressBar } from 'react-bootstrap';
import { BsPause, BsPlayFill, BsSkipEndFill, BsSkipStartFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useAudio } from '../providers/AudioProvider';
import logger from '../utils/logger';


function SmallAudioPlayerImpl() {
  const {
    play,
    playNext,
    playPrevious,
    pause,
    rzAudio,
    isPlaying,
    currentTime,
    duration } = useAudio();

  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // const handleRewind = () => {
  //   if (currentTime) {
  //     setCurrentTime(Math.max(0, currentTime - 10));
  //   }
  // };

  // const handleForward = () => {
  //   if (currentTime) {
  //     setCurrentTime(Math.min(duration, currentTime + 10));
  //   }
  // };

  const handlePrevious = useCallback(() => {
    playPrevious();
  }, [playPrevious]);

  const handleNext = useCallback(() => {
    playNext();
  }, [playNext]);

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

  const onTextClick = () => {
    router.push(`/audio/${rzAudio?.id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };



  return (
    <div className='bg-dark pt-2 pb-1 w-100'>
      <div className="d-flex justify-content-between align-items-center w-100">
        {rzAudio ? (
          <div className="d-flex align-items-center text-light bg-dark flex-grow-1 w-100" style={{ maxWidth: "calc(100% - 200px)", }} onClick={onTextClick}>
            <Image alt="Audio cover" src={imageUrl} rounded className="me-3" width={30} height={30} />
            <div className='flex-shrink-1 w-100 pb-2'>
              <div className='w-100'>
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  className='small'
                >
                  {rzAudio.name}
                </div>
              </div>
              <div>
                <small>{rzAudio.channel.name}</small>
              </div>
            </div>
          </div>
        ) : null}
        <div className="d-flex align-items-center">
          <ButtonGroup>
            {/* <Button variant="dark" onClick={handlePlaying}>
              <BsList size={30} />
            </Button> */}
            <Button variant="dark" onClick={handlePrevious}>
              <BsSkipStartFill size={20} />
            </Button>
            <Button variant="dark" onClick={togglePlayPause}>
              {isPlaying ? (<BsPause size={30} />) : (<BsPlayFill size={30} />)}
            </Button>
            <Button variant="dark" onClick={handleNext}>
              <BsSkipEndFill size={20} />
            </Button>
          </ButtonGroup>
        </div>
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
      <SmallAudioPlayerImpl />
    </React.Suspense>
  )
}

