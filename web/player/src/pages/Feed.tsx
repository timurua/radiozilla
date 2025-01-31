import { useRecoilValue } from 'recoil';
import { AudioList } from '../components/AudioList';
import { AllChannelList } from '../components/ChannelList';
import PlayerScreen from '../components/PlayerScreen';
import { Suspense, useEffect, useState } from 'react';
import { SuspenseLoading } from '../components/SuspenseLoading';
import { getFeedAudioList } from '../data/firebase';
import { RZAudio } from '../data/model';
import { userDataSubscribedChannelIdsSelector } from '../state/userData';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useAudio } from '../providers/AudioProvider';

export enum PlayableFeedMode {
  Latest = "Latest",
  Subscribed = "Subscribed",
}

function InnerFeed() {

  const [feedMode, setFeedMode] = useState<PlayableFeedMode>(PlayableFeedMode.Latest);
  const [rzAudios, setRzAudios] = useState<RZAudio[]>([]);
  const userDataSubscribedChannelIds = useRecoilValue(userDataSubscribedChannelIdsSelector);
  const { setRzAudios: setPlayerRzAudios } = useAudio();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudios = async () => {
      const audios = await getFeedAudioList(feedMode, userDataSubscribedChannelIds);
      setRzAudios(audios);
      setIsLoading(false);
    };
    fetchAudios();
  }, [feedMode, userDataSubscribedChannelIds]);

  const onAudioClick = () => {
    setPlayerRzAudios(rzAudios);
  };

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
      isLoading ? <SuspenseLoading /> : (

        feedMode === PlayableFeedMode.Latest ?
          (<AudioList rzAudios={rzAudios} onClick={onAudioClick} />) :
          (rzAudios.length > 0
            ? (<AudioList rzAudios={rzAudios} onClick={onAudioClick} />)
            : (<div>
              No subscribed channels
              <div>
                <AllChannelList />
              </div>
            </div>)
          ))}
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
