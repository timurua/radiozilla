import React, { Suspense } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { SuspenseLoading } from '../components/SuspenseLoading';
import PlayerScreen from '../components/PlayerScreen';

const Company: React.FC = () => {
    return (
        <Suspense fallback={<SuspenseLoading />}>
            <PlayerScreen>
                <Container className="py-5">
                    <Row className="mb-5">
                        <Col>
                            <h2 className="text-center mb-4">About Our Company</h2>
                            <p className="text-center lead">
                                We are dedicated to bringing you the best tech blogs audio experience
                            </p>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col>
                            <Card className="bg-dark text-white border-light">
                                <Card.Body className="text-center">
                                    <Card.Title>Open Source Project</Card.Title>
                                    <Card.Text>
                                        Radiozilla is proudly open source! We believe in transparency and community-driven development.
                                        Check out our source code and contribute on GitHub.
                                    </Card.Text>
                                    <a 
                                        href="https://github.com/timurua/radiozilla/" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-outline-light"
                                    >
                                        View on GitHub
                                    </a>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </PlayerScreen>
        </Suspense>
    );
};

export default Company;
