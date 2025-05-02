'use client';

import React from 'react';
import { Spinner as BootstrapSpinner, Card } from 'react-bootstrap';

interface SpinnerProps {
    text: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
    return (
        <Card className="bg-dark text-white" style={{ width: '18rem', textAlign: 'center', padding: '1rem' }}>
            <Card.Body>
                <BootstrapSpinner animation="border" role="status" />
                <Card.Text>{text}</Card.Text>
            </Card.Body>
        </Card>
    );
};

export default Spinner;