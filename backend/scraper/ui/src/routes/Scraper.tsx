import React, { useEffect, useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import Client from '../api/client';
import { configuration } from '../api/client';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAScraperStats } from '../api';

const Scraper: React.FC = () => {
    const [url, setUrl] = useState('https://www.anthropic.com/');
    const [maxDepth, setMaxDepth] = useState(5);
    const [noCache, setNoCache] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scraperStats, setScraperStats] = useState<FAScraperStats | null>(null);

    const [_, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Create WebSocket connection
        const ws = new WebSocket(configuration.basePath?? '');
        var reconnect = true;
        setSocket(ws);

        ws.onopen = () => {
        };

        ws.onmessage = (event) => {
            setMessages(prev => [event.data, ...prev]);
        };

        ws.onerror = function (error) {
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            if (reconnect) {
                setTimeout(() => {
                    const newWs = new WebSocket(configuration.basePath?? '');
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
            const response = await Client.scraperRunApiV1ScraperRunPost({
                url,
                "max_depth": maxDepth,
                "no_cache": noCache
            });
            setScraperStats(response.data);

        } catch (error) {
            console.error('Error searching similar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopScraping = async () => {
        try {
            await Client.scraperStopApiV1ScraperStopPost();
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
            {scraperStats && (
                <Row className="my-4">
                    <Col>
                        <ListGroup>
                            {Object.entries(scraperStats.domain_stats).map(([domain, domainStats]) => (
                                <ListGroup.Item key={domain}>
                                    <h5>{domain}</h5>
                                    <div>
                                        {Object.entries(domainStats.frequent_subpaths).map(([path, count]) => (
                                            <div key={path}>
                                                {String(path)}: {Number(count)}
                                            </div>
                                        ))}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                </Row>
            )}
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