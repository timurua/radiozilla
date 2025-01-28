import { useEffect, useState } from 'react';
import { Card, Image, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AudioListItem } from '../components/AudioListItem';
import { BootstrapBackButton } from '../components/BackButton';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListForChannel, getChannel } from '../data/firebase';
import { RZAudio, RZChannel } from "../data/model";
import { storageUtils } from '../firebase';
import logger from '../utils/logger';


function Channel() {

  const { channelId } = useParams();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const [rzAudios, setRZAudios] = useState<RZAudio[]>([]);
  const [rzChannel, setRZChannel] = useState<RZChannel | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      if (!channelId) {
        return;
      }
      const channel = await getChannel(channelId);
      try {
        const url = await storageUtils.toDownloadURL(channel.imageUrl);
        setImageUrl(url);
      } catch (error) {
        logger.error('Error fetching image URL from Firebase Storage:', error);
      }
      setRZChannel(channel);
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
        {rzChannel ? (
          <div>
            <Card className='bg-dark text-white border-secondary no-select d-flex flex-row align-items-center'>
              {imageUrl && <Image src={imageUrl} rounded className="m-3 text-light" width={50} height={50} />}
              <Card.Body>
                <Card.Title>{rzChannel.name}</Card.Title>
                <Card.Text>{rzChannel.description}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        ) : null}

        <Card className='bg-dark text-white mt-3 border-secondary'>
          <Card.Body>
            <ListGroup variant="flush" className='bg-dark text-white'>
              {rzAudios.length === 0 ? (
                <ListGroup.Item className='bg-dark text-white'>No Audios</ListGroup.Item>
              ) : rzAudios.map((rzAudio) => (
                <AudioListItem key={rzAudio.id} rzAudio={rzAudio} />
              ))}
            </ListGroup>

          </Card.Body>
        </Card>
      </div>
    </PlayerScreen>
  );
}

export default Channel;
