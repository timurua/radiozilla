import AudioPlayer from 'react-modern-audio-player';
import { useRecoilValue } from 'recoil';
import { currentUserPlayablesState } from '../state/main';
import React from 'react';

function Player (){
  const playables = useRecoilValue(currentUserPlayablesState);
  var id = 0;
  const playList = playables.map(playable => ({
    name: playable.name,
    writer: playable.writer,
    img: playable.imageUrl,
    src: playable.audioUrl,
    id: id++,
  }));
	return (
		<AudioPlayer playList={playList} />
	)
}

export function PlayablePlayer() {
  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Player />
      </React.Suspense>
    </div>
  );
}