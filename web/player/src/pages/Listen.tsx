import { useEffect, useRef, useState } from 'react';
import { AudioList } from '../components/AudioList';
import { AudioPlayer } from '../components/AudioPlayer';
import { PlayableSortingSelector } from '../components/PlayableSortingSelector';
import PlayerScreen, { PlayerPosition } from '../components/PlayerScreen';

function Listen() {
  const [playerMinimized, setPlayerMinimized] = useState(false);
  const playerWithSortingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (playerWithSortingRef.current) {
        const sortingSelectorRect = playerWithSortingRef.current.getBoundingClientRect();

        if (sortingSelectorRect.bottom <= 50) {
          // PlayableSortingSelector has scrolled out of view
          setPlayerMinimized(true);
        } else {
          setPlayerMinimized(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call handler immediately to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <PlayerScreen playerPosition={playerMinimized ? PlayerPosition.TOP : undefined} >

      <div ref={playerWithSortingRef}>
        <PlayableSortingSelector />
        <AudioPlayer />
      </div>
      <AudioList searchString={undefined} />
    </PlayerScreen>
  );
}

export default Listen;
