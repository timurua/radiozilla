import { Suspense, useEffect, useState } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import { AudioListItem } from '../components/AudioListItem';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListByIds, getChannels, getUserData, } from '../data/firebase';
import { RZAudio, RZChannel } from "../data/model";
import { useAuth } from '../providers/AuthProvider';
import ChannelListItem from '../components/ChannelListItem';

function UserProfile() {

  const { user } = useAuth();
  const [playedAudios, setPlayedAudios] = useState<RZAudio[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<RZChannel[]>([]);

  useEffect(() => {    
    const fetchHistory = async () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }

      const userData = await getUserData(userId);
      const userSubscribedChannels = await getChannels(userData.subscribedChannelIds);
      setSubscribedChannels(userSubscribedChannels);

      const userPlayedAudios = await getAudioListByIds(userData.playedAudioIds);
      setPlayedAudios(userPlayedAudios);
    };

    fetchHistory();
  }, [user]);

  return (

    <Suspense fallback={<div>Loading...</div>}>
      <PlayerScreen>
        <Card className='bg-dark text-white border-secondary'>
          <Card.Body>
            {/* Profile Header */}
            <Row>
              {/* Column with natural width based on its content */}
              <Col xs="auto">
                {user ? (
                  <BsPersonCircle size={20} />
                ) : (<BsPerson size={20} />
                )}
              </Col>

              {/* Column that takes up the remaining space */}
              <Col>
                {user?.name ? (
                  <Card.Text>{user.name}</Card.Text>
                ) : (
                  <Card.Text>Guest</Card.Text>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Card className='bg-dark text-white mt-3 border-secondary'>
          <Card.Body>
            <Card.Title>Subscribed Channels</Card.Title>
            <ListGroup variant="flush" className='bg-dark text-white'>
              {subscribedChannels.length === 0 ? (
                <ListGroup.Item className='bg-dark text-white'>Subscribed to channels to get the latest updates</ListGroup.Item>
              ) : subscribedChannels.map((channel) => (
                <ChannelListItem key={channel.id} channel={channel} />                
              ))}
            </ListGroup>

          </Card.Body>
        </Card>

        <Card className='bg-dark text-white mt-3 border-secondary'>
          <Card.Body>
            <Card.Title>History</Card.Title>
            <ListGroup variant="flush" className='bg-dark text-white'>
              {playedAudios.length === 0 ? (
                <ListGroup.Item className='bg-dark text-white'>No Subscribed Channels</ListGroup.Item>
              ) : playedAudios.map((rzAudio) => (
                <AudioListItem key={rzAudio.id} rzAudio={rzAudio} />
              ))}
            </ListGroup>

          </Card.Body>
        </Card>
      </PlayerScreen>
    </Suspense>
  );
}



export default UserProfile;