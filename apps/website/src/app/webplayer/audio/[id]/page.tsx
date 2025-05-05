'use client';

import { AudioPlayer } from '@/components/webplayer/components/AudioPlayer';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { BootstrapBackButton } from '@/components/webplayer/components/BackButton';
import { getAudio } from '@/components/webplayer/data/client';
import { useEffect, useState } from 'react';
import { RZAudio } from '@/components/webplayer/data/model';
import { useParams } from 'next/navigation';

export default function Audio() {
  const params = useParams();
  const id = params.id as string;
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
