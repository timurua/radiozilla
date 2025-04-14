import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
// import Client from '../client';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAFrontendAudio } from '../api';

const Scraper: React.FC = () => {
    const [urlOrText, setUrlOrText] = useState('https://www.anthropic.com/');
    const [loading, setLoading] = useState(false);
    const [frontendAudios, setFrontendAudios] = useState<FAFrontendAudio[]>([]);

    const handleSearch = async () => {
        try {
            setLoading(true);
            setFrontendAudios([]);
            // const response = await Client.frontendAudiosSimilarForTextApiV1FrontendAudiosSimilarForTextPost(urlOrText);
            // setFrontendAudios(response.data);

        } catch (error) {
            console.error('Error during search:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGet = async () => {
        try {
            setLoading(true);
            setFrontendAudios([]);
            // const response = await Client.frontendAudioForUrlApiV1FrontendAudioForUrlPost(urlOrText);
            // setFrontendAudios(response.data ? [response.data] : []);

        } catch (error) {
            console.error('Error during search:', error);
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
                        <Form.Label>URL/Text</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={urlOrText}
                            onChange={(e) => setUrlOrText(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" onClick={handleGet}>
                        Get By URL
                    </Button>
                </Col>
                <Col>
                    <Button variant="secondary" onClick={handleSearch}>
                        Search By Text
                    </Button>
                </Col>
            </Row>
            {frontendAudios && (
                <Row className="my-4">
                    <Col>
                        <ListGroup>
                            {frontendAudios.map((audio) => (
                                <ListGroup.Item key={audio.normalized_url_hash}>
                                    <h5>{audio.normalized_url}</h5>
                                    <div>{audio.normalized_url_hash}</div>
                                    <div>{audio.title}</div>
                                    <div>{audio.description}</div>
                                    <div>{audio.duration}</div>
                                    <div>{audio.audio_text}</div>
                                    {
                                        audio.similarity_score &&
                                        <div><strong>Similarity Score: </strong>{audio.similarity_score}</div>
                                    }
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Scraper;