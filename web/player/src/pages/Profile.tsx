import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState, Suspense } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import Client from '../client';
import PlayerScreen from '../components/PlayerScreen';
import { getListenedAudioIdsByUser, getAudioListByIds,  } from '../data/firebase';
import { RZAudio } from "../data/model";
import { db } from '../firebase';
import { useAuth } from '../providers/AuthProvider';
import { AudioListItem } from '../components/AudioListItem';

interface AudioPlay {
  rzAudio: RZAudio;
  played_at: Date;
}


function UserProfile() {

  const { user } = useAuth();
  const [audioPlayHistory, setAudioPlayHistory] = useState<RZAudio[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }

      const listenedAudioIds = await getListenedAudioIdsByUser(userId)
      const audioList = await getAudioListByIds(listenedAudioIds)
      setAudioPlayHistory(audioList);            
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
              {user?.channels.length === 0 ? (

                <ListGroup.Item className='bg-dark text-white'>No Subscribed Channels</ListGroup.Item>

              ) : user?.channels.map((channel) => (
                <ListGroup.Item className='bg-dark text-white'>{channel.name}</ListGroup.Item>
              ))}
            </ListGroup>

          </Card.Body>
        </Card>

        <Card className='bg-dark text-white mt-3 border-secondary'>
          <Card.Body>
            <Card.Title>History</Card.Title>
            <ListGroup variant="flush" className='bg-dark text-white'>
              {audioPlayHistory.length === 0 ? (
                <ListGroup.Item className='bg-dark text-white'>No Subscribed Channels</ListGroup.Item>
              ) : audioPlayHistory.map((rzAudio) => (
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