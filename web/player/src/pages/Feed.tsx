import { Suspense, useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import { AudioList } from '../components/AudioList';
import PlayerScreen from '../components/PlayerScreen';
import { SuspenseLoading } from '../components/SuspenseLoading';
import { FeedAudioLoader } from '../data/loaders';
import { useAudio } from '../providers/AudioProvider';
import { userDataSubscribedChannelIdsSelector } from '../state/userData';

export enum PlayableFeedMode {
  Latest = "Latest",
  Subscribed = "Subscribed",
}

function InnerFeed() {

  const [feedMode, setFeedMode] = useState<PlayableFeedMode>(PlayableFeedMode.Latest);
  const userDataSubscribedChannelIds = useRecoilValue(userDataSubscribedChannelIdsSelector);
  const { setAudioPrevNext } = useAudio();

  useEffect(() => {
    const feedAudioList = new FeedAudioLoader(feedMode, userDataSubscribedChannelIds);    
    setAudioPrevNext(feedAudioList);
  }, [feedMode, userDataSubscribedChannelIds]);

  const audioLoader = useMemo(() => {
    return new FeedAudioLoader(feedMode, userDataSubscribedChannelIds);
  }, [feedMode, userDataSubscribedChannelIds]);

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
    <AudioList audioLoader={audioLoader} />
  </>;
}

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
