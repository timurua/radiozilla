import { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AudioListItem } from '../components/AudioListItem';
import { BootstrapBackButton } from '../components/BackButton';
import { ChannelList } from '../components/ChannelList';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListForChannel } from '../data/firebase';
import { RZAudio } from "../data/model";


function Channel() {

  const { channelId } = useParams();
  const [rzAudios, setRZAudios] = useState<RZAudio[]>([]);


  useEffect(() => {
    const fetchChannel = async () => {
      if (!channelId) {
        return;
      }
      const audios = await getAudioListForChannel(channelId);
      setRZAudios(audios);
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

        <ListGroup variant="flush" className='bg-dark text-white w-100'>
          {rzAudios.length === 0 ? (
            <ListGroup.Item className='bg-dark text-white'>No Audios</ListGroup.Item>
          ) : rzAudios.map((rzAudio) => (
            <AudioListItem key={rzAudio.id} rzAudio={rzAudio} />
          ))}
        </ListGroup>

      </div>
    </PlayerScreen>
  );
}

export default Channel;
