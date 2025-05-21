'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AudioList from '@/components/webplayer/components/AudioList';
import { BootstrapBackButton } from '@/components/webplayer/components/BackButton';
import { ChannelList } from '@/components/webplayer/components/ChannelList';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { SuspenseLoading } from '@/components/webplayer/components/SuspenseLoading';
import { getAudioListForChannel } from '@/lib/db/client';
import { MultiAudioLoader } from '@/components/webplayer/data/loaders';
import AudioLoader from '@/components/webplayer/utils/AudioLoader';



function Channel() {

  const params = useParams();
  const id = params.id as string;
  const [loader, setLoader] = useState<AudioLoader | null>(null);


  useEffect(() => {
    const fetchChannel = async () => {
      if (!id) {
        return;
      }
      const audios = await getAudioListForChannel(id);
      const loader = new MultiAudioLoader(audios);
      setLoader(loader);
    };

    fetchChannel();
  }, [id]);

  return (
    <PlayerScreen noShowSmallPlayer={false}>
      <div className="mb-3">
        <BootstrapBackButton size="lg" />
      </div>
      <div>
        <h5 className="mt-4 text-light">Channel</h5>
        {id && <ChannelList channelIds={[id]} />}

        <h5 className="mt-4 text-light">Audios</h5>
        {loader ? <AudioList audioLoader={loader} showDates={true} /> : <SuspenseLoading />}
      </div>
    </PlayerScreen>
  );
}

export default Channel;
