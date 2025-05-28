'use client';

import { Suspense, useMemo } from 'react';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import { observer } from "mobx-react-lite";
import { userDataStore } from "@/components/webplayer/state/userData";
import AudioList from '@/components/webplayer/components/AudioList';
import ChannelListItem from '@/components/webplayer/components/ChannelListItem';
import PlayerScreen from '@/components/webplayer/components/PlayerScreen';
import { IdsAudioLoader } from '@/components/webplayer/data/loaders';
import { useCurrentUserSuspense } from '@/lib/query/hooks';

const UserProfile = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfileInner />
    </Suspense>
  );
}


const UserProfileInner = observer(function UserProfile() {

  const { data: user } = useCurrentUserSuspense();
  const userData = userDataStore.userData;

  const audioLoader = useMemo(() => {
    return new IdsAudioLoader([...userData.playedAudioIds].reverse());
  }, [userData.playedAudioIds]);

  return (
    <PlayerScreen>
      <Card className='bg-dark text-white border-secondary'>
        <Card.Body>
          {/* Profile Header */}
          <Row>
            {/* Column with natural width based on its content */}
            <Col xs="auto">
              {user ? (
                <BsPersonCircle size={20} />
              ) : (
                <BsPerson size={20} />
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
          <h5 className="mt-4 text-light">Subscribed Channels</h5>
          <ListGroup variant="flush" className='bg-dark text-white w-100'>
            {userData.subscribedChannelIds.length === 0 ? (
              <ListGroup.Item className='bg-dark text-white'>Subscribe to channels to get the latest updates</ListGroup.Item>
            ) : userData.subscribedChannelIds.map((channelId) => (
              <ChannelListItem key={channelId} channelId={channelId} />
            ))}
          </ListGroup>

          <h5 className="mt-4 text-light">History</h5>

          {userData.playedAudioIds.length > 0 ?
            <AudioList audioLoader={audioLoader} showDates={false} /> :
            <div className='bg-dark text-white'>No audios in history</div>
          }
        </Card.Body>
      </Card>
    </PlayerScreen>
  );
});

export default UserProfile;