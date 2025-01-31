import { Suspense, useEffect, useState } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import { useRecoilValue } from 'recoil';
import { AudioListItem } from '../components/AudioListItem';
import ChannelListItem from '../components/ChannelListItem';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListByIds } from '../data/firebase';
import { RZAudio } from "../data/model";
import { useAuth } from '../providers/AuthProvider';
import { userDataState } from '../state/userData';

function UserProfile() {

  const { user } = useAuth();
  const [playedAudios, setPlayedAudios] = useState<RZAudio[]>([]);
  const userData = useRecoilValue(userDataState);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }
      const userPlayedAudios = await getAudioListByIds(userData.playedAudioIds);
      setPlayedAudios(userPlayedAudios);
    };

    fetchHistory();
  }, [user, userData]);

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
        <h5 className="mt-4 text-light">Subscribed Channels</h5>
        <ListGroup variant="flush" className='bg-dark text-white w-100'>
          {userData.subscribedChannelIds.length === 0 ? (
            <ListGroup.Item className='bg-dark text-white'>Subscribe to channels to get the latest updates</ListGroup.Item>
          ) : userData.subscribedChannelIds.map((channelId) => (
            <ChannelListItem key={channelId} channelId={channelId} />
          ))}
        </ListGroup>

        <h5 className="mt-4 text-light">History</h5>

        <ListGroup variant="flush" className='bg-dark text-white w-100'>
          {playedAudios.length === 0 ? (
            <ListGroup.Item className='bg-dark text-white'>No audios in history</ListGroup.Item>
          ) : playedAudios.map((rzAudio) => (
            <AudioListItem key={rzAudio.id} rzAudio={rzAudio} />
          ))}
        </ListGroup>

      </PlayerScreen>
    </Suspense>
  );
}



export default UserProfile;