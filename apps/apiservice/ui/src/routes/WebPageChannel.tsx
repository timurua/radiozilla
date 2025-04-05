import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAScraperStats } from '../api';
import Client, { wsPath } from '../client';
import { useParams } from 'react-router-dom';

const WebPageChannel: React.FC = () => {
    const { channelId } = useParams();
    const [url, setUrl] = useState<null|string>('');
    const [normalizedUrl, setNormalizedUrl] = useState<null|string>('');
    const [normalizedUrlHash, setNormalizedUrlHash] = useState<null|string>('');
    const [name, setName] = useState<null|string>('');
    const [description, setDescription] = useState<null|string>('');
    const [imageUrl, setImageUrl] = useState<null|string>('');
    const [enabled, setEnabled] = useState(false);
    const [scraperSeeds, setScraperSeeds] = useState<Array<{ [key: string]: string; }> | null>([]);
    const [includePathPatterns, setIncludePathPatterns] = useState<Array<string> | null>([]);
    const [excludePathPatterns, setExcludePathPatterns] = useState<Array<string> | null>([]);
    const [scraperFollowWebPageLinks, setScraperFollowWebPageLinks] = useState(false);
    const [scraperFollowFeedLinks, setScraperFollowFeedLinks] = useState(true);
    const [scraperFollowSitemapLinks, setScraperFollowSitemapLinks] = useState(true);

    const [loading, setLoading] = useState(false);
    const [scraperStats, setScraperStats] = useState<FAScraperStats | null>(null);

    const [_, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const fetchChannel = async () => {
            if (!channelId) {
                return;
            }
            const response = await Client.getChannelByUrlApiV1WebPageChannelByIdGet({
                id: channelId,
            });
            setUrl(response.data.url);
            setNormalizedUrl(response.data.normalized_url);
            setNormalizedUrlHash(response.data.normalized_url_hash);
            setName(response.data.name);
            setDescription(response.data.description);
            setImageUrl(response.data.image_url);
            setEnabled(response.data.enabled ?? false);
            setScraperSeeds(response.data.scraper_seeds ?? []);
            setIncludePathPatterns(response.data.include_path_patterns);
            setExcludePathPatterns(response.data.exclude_path_patterns);
            setScraperFollowWebPageLinks(response.data.scraper_follow_web_page_links ?? false);
            setScraperFollowFeedLinks(response.data.scraper_follow_feed_links ?? false);
            setScraperFollowSitemapLinks(response.data.scraper_follow_sitemap_links ?? false);
            setLoading(false);
        };

        fetchChannel();
    }, [channelId]);


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
        if (!url) {
            return;
        }
        const channel = {
            url: url,
            normalized_url: normalizedUrl,
            normalized_url_hash: normalizedUrlHash,
            name: name,
            description: description,
            image_url: imageUrl,
            enabled: enabled,
            scraper_seeds: scraperSeeds,
            include_path_patterns: includePathPatterns,
            exclude_path_patterns: excludePathPatterns,
            scraper_follow_web_page_links: scraperFollowWebPageLinks,
            scraper_follow_feed_links: scraperFollowFeedLinks,
            scraper_follow_sitemap_links: scraperFollowSitemapLinks,
        };
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
                            value={url??""}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={name??""}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={description??""}
                            onChange={(e) => setDescription(e.target.value)}
                        />                        
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={imageUrl??""}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />        
                        <Form.Check 
                            type="switch"
                            id="enabled-switch"
                            label="Enabled"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <Form.Label>Scraper Seeds</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={scraperSeeds?.map(seed => JSON.stringify(seed)).join('\n') ?? ""}
                            onChange={(e) => setScraperSeeds(e.target.value.split('\n').map(line => JSON.parse(line)))}
                        />
                        <Form.Label>Include Path Patterns</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={includePathPatterns?.join('\n') ?? ""}
                            onChange={(e) => setIncludePathPatterns(e.target.value.split('\n'))}
                        />
                        <Form.Label>Exclude Path Patterns</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={excludePathPatterns?.join('\n') ?? ""}
                            onChange={(e) => setExcludePathPatterns(e.target.value.split('\n'))}
                        />
                        <Form.Check 
                            type="switch"
                            id="scraper-follow-web-page-links-switch"
                            label="Follow Web Page Links"
                            checked={scraperFollowWebPageLinks}
                            onChange={(e) => setScraperFollowWebPageLinks(e.target.checked)}
                        />
                        <Form.Check 
                            type="switch"
                            id="scraper-follow-feed-links-switch"
                            label="Follow Feed Links"
                            checked={scraperFollowFeedLinks}
                            onChange={(e) => setScraperFollowFeedLinks(e.target.checked)}
                        />
                        <Form.Check 
                            type="switch"
                            id="scraper-follow-sitemap-links-switch"
                            label="Follow Sitemap Links"
                            checked={scraperFollowSitemapLinks}
                            onChange={(e) => setScraperFollowSitemapLinks(e.target.checked)}
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