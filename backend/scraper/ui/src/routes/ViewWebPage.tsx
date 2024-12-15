import React, { useState } from 'react';
import { Container, Form, Button, Table, Alert } from 'react-bootstrap';
import { WebPage } from '../types/api';
import { fetchWebPage } from '../services/api';

const ViewWebPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [pageData, setPageData] = useState<WebPage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const webPage = await fetchWebPage(url);
            setPageData(webPage);
        } catch (err) {
            setError('Failed to fetch webpage data');
            setPageData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <h1>View Web Page</h1>
            <Form onSubmit={handleSubmit} className="mb-4">
                <Form.Group className="mb-3">
                    <Form.Label>Enter URL</Form.Label>
                    <Form.Control
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                    />
                </Form.Group>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'View Page'}
                </Button>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}

            {pageData && (

            <Table striped bordered hover className="mt-3">
                <tbody>
                    <tr>
                        <td>URL</td>
                        <td>{pageData.url}</td>
                    </tr>
                    <tr>
                        <td>Normalized URL</td>
                        <td>{pageData.normalized_url}</td>
                    </tr>
                    <tr>
                        <td>Status Code</td>
                        <td>{pageData.status_code}</td>
                    </tr>
                    <tr>
                        <td>Content Type</td>
                        <td>{pageData.content_type}</td>
                    </tr>
                    <tr>
                        <td>Content Charset</td>
                        <td>{pageData.content_charset}</td>
                    </tr>                    
                    <tr>
                        <td>Metadata Title</td>
                        <td>{pageData.metadata_title}</td>
                    </tr>
                    <tr>
                        <td>Metadata Description</td>
                        <td>{pageData.metadata_description}</td>
                    </tr>
                    
                    <tr>
                        <td>Metadata Published At</td>
                        <td>{pageData.metadata_published_at && new Date(pageData.metadata_published_at).toLocaleDateString()}</td>
                    </tr>
                
                    
                    <tr>
                        <td>Preview Image</td>
                        <td>
                            <img 
                                src={pageData.metadata_image_url} 
                                alt="Page preview" 
                                style={{ maxWidth: '300px' }}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td>Canonical URL</td>
                        <td>{pageData.canonical_url}</td>
                    </tr>

                    <tr>
                        <td>Outgoing URLs</td>
                        <td>
                            <ul>
                                {pageData.outgoing_urls?.map((url, index) => (
                                    <li key={index}>
                                        <a href={url} target="_blank" rel="noreferrer">{url}</a>
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>

                    <tr>
                        <td>Visible Text</td>
                        <td>{pageData.visible_text}</td>
                    </tr>

                    <tr>
                        <td>Sitemap URL</td>
                        <td>{pageData.sitemap_url}</td>
                    </tr>

                    <tr>
                        <td>Robots Content</td>
                        <td>
                            <ul>
                                {pageData.robots_content?.map((content, index) => (
                                    <li key={index}>{content}</li>
                                ))}
                            </ul>
                        </td>
                    </tr>

                    <tr>
                        <td>Text Chunks</td>
                        <td>
                            <ul>
                                {pageData.text_chunks?.map((chunk, index) => (
                                    <li key={index}>{chunk}</li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                    
                </tbody>
            </Table>
            )}
        </Container>
    );
};

export default ViewWebPage;