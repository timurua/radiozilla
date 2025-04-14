import React, { useState } from 'react';
import { Tabs, Tab, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './SignIn';
import SignUp from './SignUp';

// These components will need to be created separately

const SignInOrUp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('signin');

    const handleTabSelect = (tab: string | null) => {
        if (tab) {
            setActiveTab(tab);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col>
                    <Tabs
                        id="auth-tabs"
                        activeKey={activeTab}
                        onSelect={handleTabSelect}
                        className="mb-3"
                    >
                        <Tab eventKey="signin" title="Sign In">
                            <SignIn />
                        </Tab>
                        <Tab eventKey="signup" title="Sign Up">
                            <SignUp />
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    );
};

export default SignInOrUp;