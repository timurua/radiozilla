import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { FAWebPageChannel } from '../../api';
import Client from '../../client';

interface DetailsProps {
    channel: FAWebPageChannel;
}

const Details: React.FC<DetailsProps> = ({ channel: initialChannel }) => {
    const [url, setUrl] = useState<null | string>('');
    const [normalizedUrl, setNormalizedUrl] = useState<null | string>('');
    const [normalizedUrlHash, setNormalizedUrlHash] = useState<null | string>('');
    const [name, setName] = useState<null | string>('');
    const [description, setDescription] = useState<null | string>('');
    const [imageUrl, setImageUrl] = useState<null | string>('');
    const [enabled, setEnabled] = useState(false);
    const [scraperSeeds, setScraperSeeds] = useState<Array<{ [key: string]: string; }> | null>([]);
    const [includePathPatterns, setIncludePathPatterns] = useState<Array<string> | null>([]);
    const [excludePathPatterns, setExcludePathPatterns] = useState<Array<string> | null>([]);
    const [scraperFollowWebPageLinks, setScraperFollowWebPageLinks] = useState(false);
    const [scraperFollowFeedLinks, setScraperFollowFeedLinks] = useState(true);
    const [scraperFollowSitemapLinks, setScraperFollowSitemapLinks] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // If initialChannel is provided, use it
        if (initialChannel) {
            setUrl(initialChannel.url);
            setNormalizedUrl(initialChannel.normalized_url);
            setNormalizedUrlHash(initialChannel.normalized_url_hash);
            setName(initialChannel.name);
            setDescription(initialChannel.description);
            setImageUrl(initialChannel.image_url);
            setEnabled(initialChannel.enabled ?? false);
            setScraperSeeds(initialChannel.scraper_seeds ?? []);
            setIncludePathPatterns(initialChannel.include_path_patterns);
            setExcludePathPatterns(initialChannel.exclude_path_patterns);
            setScraperFollowWebPageLinks(initialChannel.scraper_follow_web_page_links ?? false);
            setScraperFollowFeedLinks(initialChannel.scraper_follow_feed_links ?? false);
            setScraperFollowSitemapLinks(initialChannel.scraper_follow_sitemap_links ?? false);
        }
    }, [initialChannel]);

    const getChannel = () => {
        return {
            url: url ?? initialChannel?.url,
            normalized_url: normalizedUrl ?? "",
            normalized_url_hash: normalizedUrlHash ?? "",
            name: name ?? "",
            description: description ?? "",
            image_url: imageUrl,
            enabled: enabled,
            scraper_seeds: scraperSeeds,
            include_path_patterns: includePathPatterns,
            exclude_path_patterns: excludePathPatterns,
            scraper_follow_web_page_links: scraperFollowWebPageLinks,
            scraper_follow_feed_links: scraperFollowFeedLinks,
            scraper_follow_sitemap_links: scraperFollowSitemapLinks,
        };
    };

    const handleSave = async () => {
        if (!url) {
            return;
        }
        try {
            const channel = getChannel();
            Client.upsertWebPageChannelApiV1WebPageChannelPost(channel);
        } catch (error) {
            console.error('Error saving channel:', error);
        }
    }

    return (
        <Container>

            <Row className="my-4">
                <Col>
                    <Form.Group controlId="textArea">
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={url ?? ""}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={name ?? ""}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={description ?? ""}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        {showDetails && (
                            <>
                                <Form.Label>Image URL</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    value={imageUrl ?? ""}
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
                            </>)}
                        <Button variant="link" onClick={() => setShowDetails(!showDetails)}>
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </Button>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" onClick={handleSave}>
                        Save
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default Details;