import { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AudioListItem } from '../components/AudioListItem';
import { BootstrapBackButton } from '../components/BackButton';
import { ChannelList } from '../components/ChannelList';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListForChannel } from '../data/firebase';
import { RZAudio } from "../data/model";
import AudioLoader from '../utils/AudioLoader';
import { MultiAudioLoader } from '../data/loaders';
import AudioList from '../components/AudioList';
import { SuspenseLoading } from '../components/SuspenseLoading';


function Channel() {

  const { channelId } = useParams();
  const [loader, setLoader] = useState<AudioLoader|null>(null);


  useEffect(() => {
    const fetchChannel = async () => {
      if (!channelId) {
        return;
      }
      const audios = await getAudioListForChannel(channelId);
      const loader = new MultiAudioLoader(audios);
      setLoader(loader);
    };

    fetchChannel();
  }, [channelId]);

  return (
    <PlayerScreen noShowSmallPlayer={false}>
      <div className="mb-3">
        <BootstrapBackButton size="lg" />
      </div>
      <div>
        <h5 className="mt-4 text-light">Channel</h5>
        {channelId && <ChannelList channelIds={[channelId]} />}

        <h5 className="mt-4 text-light">Audios</h5>
        {loader ? <AudioList audioLoader={loader} showDates={true} /> : <SuspenseLoading/>}
      </div>
    </PlayerScreen>
  );
}

export default Channel;
