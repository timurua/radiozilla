import { useRecoilValue } from 'recoil';
import { AudioList } from '../components/AudioList';
import { AllChannelList } from '../components/ChannelList';
import { PlayableModeSelector } from '../components/PlayableSelector';
import PlayerScreen from '../components/PlayerScreen';
import { rzAudiosState } from '../state/audio';
import { Suspense } from 'react';
import { SuspenseLoading } from '../components/SuspenseLoading';

function InnerFeed() {
  const rzAudios = useRecoilValue(rzAudiosState);
  return rzAudios.length > 0 ? <AudioList /> : <>
    <div>Subscribe to more channels</div>
    <AllChannelList />
  </>;
}

function Feed() {



  return (
    <PlayerScreen>
      <div>
        <PlayableModeSelector />
      </div>
      <Suspense fallback={<SuspenseLoading />}>
        <InnerFeed />
      </Suspense>
    </PlayerScreen>
  );
}

export default Feed;
