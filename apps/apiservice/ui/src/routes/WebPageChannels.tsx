import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Button, Modal, Form } from 'react-bootstrap';
import Client from '../client';
import { FAWebPageChannel } from '../api';
import { useNavigate } from 'react-router-dom';


const AddWebPageSeeds: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [newSeed, setNewWebPageChannel] = useState<FAWebPageChannel>({
        normalized_url_hash: '',
        normalized_url: '',
        url: '',
        name: '',
        description: '',
        image_url: '',
        enabled: false,
        scraper_seeds: [],
        include_path_patterns: [],
        exclude_path_patterns: [],
        scraper_follow_web_page_links: false,
        scraper_follow_sitemap_links: false,
        scraper_follow_feed_links: false,
    });

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewWebPageChannel(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        await Client.upsertWebPageChannelApiV1WebPageChannelPost(newSeed);
        handleClose();
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Add Web Page Channel
            </Button>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Web Page Channel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUrl">
                            <Form.Label>URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="url"
                                value={newSeed.url}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>);
};

const WebPageChannels: React.FC = () => {
    const [channels, setChannels] = useState<FAWebPageChannel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getSeedsFromServer = async () => {
            try {
                const response = await Client.getWebPageChannelsApiV1WebPageChannelsGet();
                setChannels(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        };
        getSeedsFromServer();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Web Page Seeds</h2>
            <AddWebPageSeeds />
            {error ? (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    Error: {error}
                </div>
            ) : (
                <Table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">Name</th>
                            <th className="py-2">Description</th>
                            <th className="py-2">Normalized URL</th>                            
                        </tr>
                    </thead>
                    <tbody>
                        {channels?.map((channel, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">
                                    <a className="text-blue-500 hover:underline" onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/web-page-channel/${channel.normalized_url_hash}`);
                                    }}>
                                        {channel.name}
                                    </a>
                                </td>
                                <td className="border px-4 py-2">{channel.description}</td>
                                <td className="border px-4 py-2">{channel.normalized_url}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>)}
        </div>
    );
};

export default WebPageChannels;