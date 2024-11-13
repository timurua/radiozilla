import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { BsPerson, BsPersonCircle } from 'react-icons/bs';
import PlayerScreen from '../components/PlayerScreen';
import { useAuth } from '../providers/AuthProvider';


function UserProfile() {


  const { user } = useAuth();

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
            {user?.channels.length === 0 ? (

              <ListGroup.Item className='bg-dark text-white'>No Subscribed Channels</ListGroup.Item>

            ) : user?.channels.map((channel) => (
              <ListGroup.Item className='bg-dark text-white'>{channel.name}</ListGroup.Item>
            ))}
          </ListGroup>

        </Card.Body>
      </Card>
    </PlayerScreen>

  );
}



export default UserProfile;