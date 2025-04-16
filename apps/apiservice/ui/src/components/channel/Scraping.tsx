import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAScraperStats, FAWebPageChannel } from '../../api';
import Client, { wsPath } from '../../client';

interface DetailsProps {
    channel: FAWebPageChannel;
}


const WebPageChannelContents: React.FC<DetailsProps> = ({ channel }) => {

    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [scraperStats, setScraperStats] = useState<FAScraperStats | null>(null);

    const [_, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const wsScraperPath = `${wsPath}/api/v1/scraper-ws`;
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
            const response = await Client.scraperRunApiV1ScraperRunPost(channel);
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
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={channel.url ?? ""}
                            readOnly
                        />
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={channel.name ?? ""}
                            readOnly
                        />
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={channel.description ?? ""}
                            readOnly
                        />
                        {showDetails && (
                            <>
                                <Form.Label>Image URL</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    value={channel.image_url ?? ""}
                                    readOnly
                                />
                                <Form.Check
                                    type="switch"
                                    id="enabled-switch"
                                    label="Enabled"
                                    checked={channel.enabled ?? false}
                                    readOnly
                                />
                                <Form.Label>Scraper Seeds</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={channel.scraper_seeds?.map(seed => JSON.stringify(seed)).join('\n') ?? ""}
                                    readOnly
                                />
                                <Form.Label>Include Path Patterns</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={channel.include_path_patterns?.join('\n') ?? ""}
                                    readOnly
                                />
                                <Form.Label>Exclude Path Patterns</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={channel.exclude_path_patterns?.join('\n') ?? ""}
                                    readOnly
                                />
                                <Form.Check
                                    type="switch"
                                    id="scraper-follow-web-page-links-switch"
                                    label="Follow Web Page Links"
                                    checked={channel.scraper_follow_web_page_links ?? false}
                                    readOnly
                                />
                                <Form.Check
                                    type="switch"
                                    id="scraper-follow-feed-links-switch"
                                    label="Follow Feed Links"
                                    checked={channel.scraper_follow_feed_links ?? false}
                                    readOnly
                                />
                                <Form.Check
                                    type="switch"
                                    id="scraper-follow-sitemap-links-switch"
                                    label="Follow Sitemap Links"
                                    checked={channel.scraper_follow_sitemap_links ?? false}
                                    readOnly
                                />
                            </>)}
                        <Button variant="link" onClick={() => setShowDetails(!showDetails)}>
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </Button>
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

export default WebPageChannelContents;