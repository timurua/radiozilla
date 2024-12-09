import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { fetchEmbedding, fetchSimilar } from '../services/api';
import JsonViewer from '../components/JsonViewer';

const Similarity: React.FC = () => {
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');

    const handleSearchSimilar = async () => {
        try {
            const response = await fetchSimilar(text);  
            setResponse(response);
        } catch (error) {
            console.error('Error searching similar:', error);
        }
    };

    const handleFetchEmbedding = async () => {
        try {
            const response = await fetchEmbedding(text);
            setResponse(response);
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
                    <Button variant="secondary" onClick={handleFetchEmbedding}>
                        Calculate Embedding
                    </Button>
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h5>Response:</h5>
                    <pre><JsonViewer data={response}/></pre>
                </Col>
            </Row>
        </Container>
    );
};

export default Similarity;