import React, { useEffect, useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { startScraper, stopScraper, getScraperSocketPath } from '../services/api';
import JsonViewer from '../components/JsonViewer';
import ListGroup from 'react-bootstrap/ListGroup';

const Scraper: React.FC = () => {
    const [url, setUrl] = useState('https://www.anthropic.com/');
    const [maxDepth, setMaxDepth] = useState(5);
    const [noCache, setNoCache] = useState(true);
    const [loading, setLoading] = useState(false);

    const [_, setSocket] = useState<WebSocket|null>(null);
    const [response, setResponse] = useState<any>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Create WebSocket connection
        const ws = new WebSocket(getScraperSocketPath());
        var reconnect = true;
        setSocket(ws);

        ws.onopen = () => {
        };

        ws.onmessage = (event) => {
            setMessages(prev => [event.data, ...prev]);
        };

        ws.onerror = function(error) {
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            if (reconnect){
                setTimeout(() => {
                    const newWs = new WebSocket(getScraperSocketPath());
                    setSocket(newWs);
                }, 5000);
            }
        };

        // Cleanup on component unmount
        return () => {
            reconnect = false;
            ws.close();
        };
    }, []);

    const handleStartScraping = async () => {
        try {
            setLoading(true);
            const response = await startScraper(
                url,
                maxDepth,
                noCache
            );
            setResponse(response);
        } catch (error) {
            console.error('Error searching similar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopScraping = async () => {
        try {
            const response = await stopScraper();
            setResponse(response);
        } catch (error) {
            console.error('Error stopping scraper:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {loading && (
                <Row className="my-2">
                    <Col>
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{ width: '100%' }}>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}
            <Row className="my-4">
                <Col>
                    <Form.Group controlId="textArea">
                        <Form.Label>Seed URL</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Form.Label>Max Depth</Form.Label>
                        <Form.Control
                            type="number"
                            value={maxDepth}
                            onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                        />
                        <Form.Label>No Cache</Form.Label>
                        <Form.Check
                            type="checkbox"
                            checked={noCache}
                            onChange={(e) => setNoCache(e.target.checked)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" onClick={handleStartScraping}>
                        Start Scraping
                    </Button>
                </Col>
                <Col>
                    <Button variant="secondary" onClick={handleStopScraping}>
                        Stop Scraping
                    </Button>
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h5>Response:</h5>
                    <pre><JsonViewer data={response} /></pre>
                </Col>
            </Row>
            <ListGroup>
                {messages.map((msg, index) => (
                <ListGroup.Item key={index}>
                    {msg}
                </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default Scraper;