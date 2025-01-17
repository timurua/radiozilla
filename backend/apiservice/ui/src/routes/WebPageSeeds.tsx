import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Button, Modal, Form } from 'react-bootstrap';
import Client from '../client';
import { FAWebPageSeed } from '../api';


const AddWebPageSeeds: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [newSeed, setNewSeed] = useState<FAWebPageSeed>({
        normalized_url_hash: '',
        normalized_url: '',
        url: '',
        max_depth: 0,
        url_patterns: [] as string[],
        use_headless_browser: false,
        allowed_domains: [] as string[]
    });

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSeed(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        await Client.upsertWebPageSeedApiV1WebPageSeedsPost(newSeed);
        handleClose();
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Add Web Page Seed
            </Button>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Web Page Seed</Modal.Title>
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
                        <Form.Group controlId="formMaxDepth">
                            <Form.Label>Max Depth</Form.Label>
                            <Form.Control
                                type="number"
                                name="max_depth"
                                value={newSeed.max_depth}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUrlPatterns">
                            <Form.Label>URL Patterns</Form.Label>
                            <Form.Control
                                type="text"
                                name="url_patterns"
                                value={(newSeed.url_patterns ?? []).join(', ')}
                                onChange={e => setNewSeed(prevState => ({
                                    ...prevState,
                                    url_patterns: e.target.value.split(',').map(pattern => pattern.trim())
                                }))}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUseHeadlessBrowser">
                            <Form.Check
                                type="checkbox"
                                label="Use Headless Browser"
                                name="use_headless_browser"
                                checked={newSeed.use_headless_browser}
                                onChange={e => setNewSeed(prevState => ({
                                    ...prevState,
                                    use_headless_browser: e.target.checked
                                }))}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAllowedDomains">
                            <Form.Label>Allowed Domains (Comma separated)</Form.Label>
                            <Form.Control
                                type="text"
                                name="allowed_domains"
                                value={(newSeed.allowed_domains ?? []).join(', ')}
                                onChange={e => setNewSeed(prevState => ({
                                    ...prevState,
                                    allowed_domains: e.target.value.split(',').map(domain => domain.trim())
                                }))}
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

const WebPageSeeds: React.FC = () => {
    const [seeds, setSeeds] = useState<FAWebPageSeed[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getSeedsFromServer = async () => {
            try {
                const seeds = await Client.readWebPageSeedsApiV1WebPageSeedsGet();
                setSeeds(seeds.data);
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
                            <th className="py-2">Normalized URL</th>
                            <th className="py-2">URL</th>
                            <th className="py-2">Max Depth</th>
                            <th className="py-2">URL Patterns</th>
                            <th className="py-2">Use Headless Browser</th>
                            <th className="py-2">Allowed Domains</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seeds?.map((seed, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{seed.normalized_url}</td>
                                <td className="border px-4 py-2">{seed.url}</td>
                                <td className="border px-4 py-2">{seed.max_depth}</td>
                                <td className="border px-4 py-2">{seed.url_patterns?.join(', ')}</td>
                                <td className="border px-4 py-2">{seed.use_headless_browser ? 'Yes' : 'No'}</td>
                                <td className="border px-4 py-2">{seed.allowed_domains?.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>)}
        </div>
    );
};

export default WebPageSeeds;