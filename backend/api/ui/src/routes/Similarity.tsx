import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Similarity: React.FC = () => {
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');

    const handleSearchSimilar = async () => {
        try {
            const res = await axios.post('/api/search-similar', { text });
            setResponse(res.data);
        } catch (error) {
            console.error('Error searching similar:', error);
        }
    };

    const handleCalculateEmbedding = async () => {
        try {
            const res = await axios.post('/api/calculate-embedding', { text });
            setResponse(res.data);
        } catch (error) {
            console.error('Error calculating embedding:', error);
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <Form.Group controlId="textArea">
                        <Form.Label>Enter Text</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" onClick={handleSearchSimilar}>
                        Search Similar
                    </Button>
                </Col>
                <Col>
                    <Button variant="secondary" onClick={handleCalculateEmbedding}>
                        Calculate Embedding
                    </Button>
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h5>Response:</h5>
                    <pre>{response}</pre>
                </Col>
            </Row>
        </Container>
    );
};

export default Similarity;