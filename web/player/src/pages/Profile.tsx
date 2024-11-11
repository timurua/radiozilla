import React from 'react';
import { Card, Image, Badge, ListGroup, Alert } from 'react-bootstrap';

// Define interfaces for our data structures
interface Channel {
  id: number;
  name: string;
  picture: string;
}

interface UserData {
  name: string;
  email: string;
  profilePicture: string;
  channels: Channel[];
}

interface UserProfileProps {
  isAuthenticated: boolean;
  userData?: UserData | null;
}

// Sample data structure for channels
const defaultChannels: Channel[] = [
  { id: 1, name: 'General', picture: '/api/placeholder/50/50' },
  { id: 2, name: 'Technology', picture: '/api/placeholder/50/50' },
  { id: 3, name: 'Sports', picture: '/api/placeholder/50/50' }
];

const UserProfile: React.FC<UserProfileProps> = ({ isAuthenticated, userData = null }) => {
  // Default anonymous user data
  const anonymousUser: UserData = {
    name: 'Guest User',
    email: 'anonymous@example.com',
    profilePicture: '/api/placeholder/100/100',
    channels: defaultChannels.slice(0, 1) // Only show General channel for anonymous users
  };

  // Use authenticated user data if available, otherwise use anonymous data
  const user = isAuthenticated && userData ? userData : anonymousUser;

  return (
    <Card style={{ maxWidth: '18rem' }}>
      <Card.Body>
        {/* Profile Header */}
        <div className="d-flex align-items-center mb-3">
          <Image
            src={user.profilePicture}
            roundedCircle
            style={{ width: '64px', height: '64px', objectFit: 'cover' }}
            alt="Profile"
          />
          <div className="ms-3">
            <Card.Title className="mb-0">{user.name}</Card.Title>
            {isAuthenticated && (
              <small className="text-muted">{user.email}</small>
            )}
          </div>
        </div>

        {/* Authentication Status Badge */}
        <div className="mb-3">
          <Badge bg={isAuthenticated ? 'success' : 'secondary'}>
            {isAuthenticated ? 'Authenticated' : 'Guest'}
          </Badge>
        </div>

        {/* Subscribed Channels */}
        <div>
          <Card.Subtitle className="mb-2 text-muted">
            Subscribed Channels
          </Card.Subtitle>
          <ListGroup>
            {user.channels.map(channel => (
              <ListGroup.Item
                key={channel.id}
                className="d-flex align-items-center"
              >
                <Image
                  src={channel.picture}
                  roundedCircle
                  className="me-2"
                  style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                  alt={channel.name}
                />
                <span>{channel.name}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        {/* Call-to-action for anonymous users */}
        {!isAuthenticated && (
          <div className="mt-3">
            <Alert variant="info">
              Sign in to subscribe to more channels!
            </Alert>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default UserProfile;