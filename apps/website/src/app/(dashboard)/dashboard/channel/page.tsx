'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChannelList } from '@/components/webplayer/components/ChannelList';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { Button } from '@/components/ui/button';


const ChannelPage = () => {
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false);
  const channels = useChannelsSuspense();

  const handleAddChannel = () => {
    setAddChannelModalOpen(true);
  };

  const handleCloseAddChannelModal = () => {
    setAddChannelModalOpen(false);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <Button onClick={handleAddChannel}>Add Channel</Button>
        </CardHeader>
        <CardContent>
          <ChannelList channels={channels} />
        </CardContent>
      </Card>

      {addChannelModalOpen && (
        <Modal onHide={handleCloseAddChannelModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Channel</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter channel name" />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" placeholder="Enter channel description" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddChannelModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCloseAddChannelModal}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ChannelPage;
