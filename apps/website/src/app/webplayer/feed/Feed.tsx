'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { observer } from "mobx-react-lite";
import { userDataStore } from "@/components/webplayer/state/userData";
import { useAudio } from '@/components/webplayer/providers/AudioProvider';
import { AudioList } from '@/components/webplayer/components/AudioList';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { SuspenseLoading } from '@/components/webplayer/components/SuspenseLoading';
import { FeedAudioLoader } from '@/components/webplayer/data/loaders';
import { AllChannelList } from '@/components/webplayer/components/ChannelList';

export enum PlayableFeedMode {
  Latest = "Latest",
  Subscribed = "Subscribed",
}

const InnerFeed = observer(function InnerFeed() {

  const [feedMode, setFeedMode] = useState<PlayableFeedMode>(PlayableFeedMode.Latest);
  const userDataSubscribedChannelIds = userDataStore.subscribedChannelIds;
  const { setAudioLoader } = useAudio();

  const audioLoader = useMemo(() => {
    return new FeedAudioLoader(feedMode, userDataSubscribedChannelIds);
  }, [feedMode, userDataSubscribedChannelIds]);

  useEffect(() => {
    setAudioLoader(audioLoader);
  }, [audioLoader, setAudioLoader]);

  return <>
    <div>
      <ButtonGroup className="text-center mb-4 d-flex justify-content-center">
        <Button
          key={PlayableFeedMode.Latest}
          variant={feedMode === PlayableFeedMode.Latest ? "outline-light active" : "outline-light"}
          size="sm" onClick={() => setFeedMode(PlayableFeedMode.Latest)}>Latest</Button>
        <Button
          key={PlayableFeedMode.Subscribed}
          variant={feedMode === PlayableFeedMode.Subscribed ? "outline-light active" : "outline-light"}
          size="sm" onClick={() => setFeedMode(PlayableFeedMode.Subscribed)}>Subscribed</Button>
      </ButtonGroup>

    </div>
    {
      feedMode === PlayableFeedMode.Latest
        ? <AudioList audioLoader={audioLoader} showDates={true} />
        : ((userDataSubscribedChannelIds.length === 0)
          ? (<div>
            No subscribed channels
            <div>
              <AllChannelList />
            </div>
          </div>)
          : <AudioList audioLoader={audioLoader} />)
    }

  </>;
});

function Feed() {
  return (
    <PlayerScreen>
      <Suspense fallback={<SuspenseLoading />}>
        <InnerFeed />
      </Suspense>
    </PlayerScreen>
  );
}

export default Feed;
