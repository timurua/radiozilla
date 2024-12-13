import React, { useEffect, useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { startScraper, stopScraper, getScraperSocketPath } from '../services/api';
import JsonViewer from '../components/JsonViewer';

const Scraper: React.FC = () => {
    const [url, setUrl] = useState('https://www.anthropic.com/');
    const [maxDepth, setMaxDepth] = useState(5);
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
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            console.log(`Receved event on WebSocket ${JSON.stringify(event.data)}`);
            setMessages(prev => [...prev, event.data]);
        };

        ws.onerror = function(error) {
            console.log(`Error from WebSocket ${error}`);
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            if (reconnect){
                setTimeout(() => {
                    console.log('Attempting to reconnect...');
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
                maxDepth
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
            <div className="border rounded-lg p-4 h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                <div key={index} className="mb-2 bg-gray-100 rounded">
                    <pre>{msg}</pre>
                </div>
                ))}
            </div>
        </Container>
    );
};

export default Scraper;