import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
// import ListGroup from 'react-bootstrap/ListGroup';
// import { FAScraperStats } from '../api';
import Client from '../client';

const Scraper: React.FC = () => {
    const [url, setUrl] = useState('https://www.anthropic.com/');
    const [maxDepth, setMaxDepth] = useState(5);
    const [noCache, setNoCache] = useState(true);
    const [loading, setLoading] = useState(false);
    // const [scraperStats, setScraperStats] = useState<FAScraperStats | null>(null);

    const handleStartScraping = async () => {
        try {
            setLoading(true);
            // const response = await Client.scraperRunApiV1ScraperRunPost({
            //     url,
            //     "no_cache": noCache
            // });
            // setScraperStats(response.data);

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
            {/* {scraperStats && (
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
            )} */}
        </Container>
    );
};

export default Scraper;