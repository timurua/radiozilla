import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAScraperStats } from '../api';
import Client, { wsPath } from '../client';

const WebPageChannel: React.FC = () => {
    const [url, setUrl] = useState('https://www.anthropic.com/');
    const [name, setName] = useState('Sample Name');
    const [description, setDescription] = useState('Sample Description');
    const [maxDepth, setMaxDepth] = useState(5);
    const [noCache, setNoCache] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scraperStats, setScraperStats] = useState<FAScraperStats | null>(null);

    const [_, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    const wsScraperPath = `${wsPath}/api/v1/scraper-ws`;

    useEffect(() => {
        // Create WebSocket connection
        const ws = new WebSocket(wsScraperPath);
        var reconnect = true;
        setSocket(ws);

        ws.onopen = () => {
        };

        ws.onmessage = (event) => {
            setMessages(prev => [event.data, ...prev]);
        };

        ws.onerror = function (event) {
            console.error('WebSocket error:', event);
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            if (reconnect) {
                setTimeout(() => {
                    const newWs = new WebSocket(wsScraperPath);
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

    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)    
    url: Mapped[str] = mapped_column(String)
    normalized_url: Mapped[str] = mapped_column(String)    
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True, default=None)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    scraper_seeds: Mapped[List[Dict[str, str]]] = mapped_column(JSONB, nullable=True, default=None)
    include_path_patterns: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    exclude_path_patterns: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    scraper_follow_web_page_links: Mapped[bool] = mapped_column(Boolean, default=False)
    scraper_follow_feed_links: Mapped[bool] = mapped_column(Boolean, default=True)
    scraper_follow_sitemap_links: Mapped[bool] = mapped_column(Boolean, default=True)

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
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Form.Label>Name</Form.Label>
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

export default WebPageChannel;