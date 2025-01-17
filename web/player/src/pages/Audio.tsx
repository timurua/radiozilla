import { useEffect, useRef, useState } from 'react';
import { AudioList } from '../components/AudioList';
import { AudioPlayer } from '../components/AudioPlayer';
import PlayerScreen, { PlayerPosition } from '../components/PlayerScreen';
import { BootstrapBackButton } from '../components/BackButton';

function Listen() { 

  return (
    <PlayerScreen>
        <div className="mb-3">
            <BootstrapBackButton size="lg"/>
        </div>
      <div>
        <AudioPlayer showExtendedInfo={true}/>
      </div>
    </PlayerScreen>
  );
}

export default Listen;
