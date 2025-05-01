'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AudioList from '@/components/webplayer/components/AudioList';
import { BootstrapBackButton } from '@/components/webplayer/components/BackButton';
import { ChannelList } from '@/components/webplayer/components/ChannelList';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { SuspenseLoading } from '@/components/webplayer/components/SuspenseLoading';
import { getAudioListForChannel } from '@/components/webplayer/data/client';
import { MultiAudioLoader } from '@/components/webplayer/data/loaders';
import AudioLoader from '@/components/webplayer/utils/AudioLoader';

type ChannelPageParams = {
  params: {
    id: string
  }
}


function Channel({ params }: ChannelPageParams) {

  const { id } = params;
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
