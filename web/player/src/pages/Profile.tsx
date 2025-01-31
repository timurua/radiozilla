import { Suspense, useEffect, useState } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import { useRecoilValue } from 'recoil';
import AudioList from '../components/AudioList';
import ChannelListItem from '../components/ChannelListItem';
import PlayerScreen from '../components/PlayerScreen';
import { getAudioListByIds } from '../data/firebase';
import { RZAudio } from "../data/model";
import { useAuth } from '../providers/AuthProvider';
import { userDataState } from '../state/userData';
import { useAudio } from '../providers/AudioProvider';

function UserProfile() {

  const { user } = useAuth();
  const [playedAudios, setPlayedAudios] = useState<RZAudio[]>([]);
  const userData = useRecoilValue(userDataState);
  const { setRzAudios } = useAudio();

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }
      const userPlayedAudios = await getAudioListByIds([...userData.playedAudioIds].reverse());
      setPlayedAudios(userPlayedAudios);
    };

    fetchHistory();
  }, [user, userData]);

  const onAudioClick = () => {
    setRzAudios(playedAudios);
  };

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

        {playedAudios.length > 0 ? 
          <AudioList rzAudios={playedAudios} onClick={onAudioClick} /> : 
          <div className='bg-dark text-white'>No audios in history</div>
        }

      </PlayerScreen>
    </Suspense>
  );
}



export default UserProfile;