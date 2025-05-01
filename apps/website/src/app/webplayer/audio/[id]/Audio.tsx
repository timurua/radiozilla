'use client';

import { AudioPlayer } from '@/components/webplayer/components/AudioPlayer';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { BootstrapBackButton } from '@/components/webplayer/components/BackButton';
import { getAudio } from '@/components/webplayer/data/client';
import { useEffect, useState } from 'react';
import { RZAudio } from '@/components/webplayer/data/model';
import { FC } from 'react';

type AudioPageParams = {
  params: {
    id: string
  }
}

const Audio: FC<AudioPageParams> = ({ params }) => {

  const { id } = params;

  const [rzAudio, setRZAudio] = useState<RZAudio | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      if (!id) {
        return;
      }
      const audio = await getAudio(id);
      if (audio) {
        setRZAudio(audio)
      }
    };
    fetchAudio();
  }, [id]);

  return (
    <PlayerScreen noShowSmallPlayer={true}>
      <div className="mb-3">
        <BootstrapBackButton size="lg" />
      </div>
      <div>
        <AudioPlayer showExtendedInfo={true} displayAudio={rzAudio} />
      </div>
    </PlayerScreen>
  );
}

export default Audio;
