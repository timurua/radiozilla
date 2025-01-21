import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState, Suspense } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import Client from '../client';
import PlayerScreen from '../components/PlayerScreen';
import { audioFromData } from '../data/firebase';
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
  const [audioPlayHistory, setAudioPlayHistory] = useState<AudioPlay[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        return;
      }
      const results = await Client.frontendAudioPlaysForUserApiV1FrontendAudioPlaysForUserGet(user.id);

      // Filter out duplicates, keeping only the earliest played entry for each audio_id
      const audioIdMap = results.data.reduce((acc, item) => {
        if (!acc[item.audio_id] || new Date(acc[item.audio_id].played_at) > new Date(item.played_at)) {
          acc[item.audio_id] = item;
        }
        return acc;
      }, {} as Record<string, typeof results.data[0]>);
      const deduped = Object.values(audioIdMap);

      const audios = await Promise.all(deduped.map(async (result) => {
        const docRef = doc(db, `/audios/${result.audio_id}`);
        const data = (await getDoc(docRef)).data();
        if (!data) {
          return null;
        }
        const rzAudio = await audioFromData(data, result.audio_id);
        return { rzAudio, played_at: new Date(result.played_at) };
      }));
      const resultAudios = audios.filter((audio): audio is AudioPlay => audio?.rzAudio !== null);
      resultAudios.sort((a, b) => b?.played_at.getTime() - a?.played_at.getTime());
      setAudioPlayHistory(resultAudios);
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
            <Card.Title>Subscriptions</Card.Title>
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
              ) : audioPlayHistory.map((playedAudio) => (
                <AudioListItem key={playedAudio.rzAudio.id} rzAudio={playedAudio.rzAudio} />
              ))}
            </ListGroup>

          </Card.Body>
        </Card>
      </PlayerScreen>
    </Suspense>
  );
}



export default UserProfile;