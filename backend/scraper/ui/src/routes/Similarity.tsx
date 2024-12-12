import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { upsertEmbeddings, findSimilarEmbeddings } from '../services/api';
import JsonViewer from '../components/JsonViewer';

const Similarity: React.FC = () => {
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStartScraping = async () => {
        try {
            setLoading(true);
            const response = await findSimilarEmbeddings(text);
            setResponse(response);
        } catch (error) {
            console.error('Error searching similar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopScraping = async () => {
        try {
            setLoading(true);
            const response = await upsertEmbeddings(text);
            setResponse(response);
        } catch (error) {
            console.error('Error calculating embedding:', error);
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
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <Form.Label>Max Depth</Form.Label>
                        <Form.Control
                            type="number"
                            value={5}
                            onChange={(e) => console.log('Max Depth:', e.target.value)}
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
        </Container>
    );
};

export default Similarity;