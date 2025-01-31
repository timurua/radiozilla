import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, Container } from 'react-bootstrap';
import { Components } from 'react-markdown';

interface BootstrapMarkdownProps {
    markdownContent: string;
}

const BootstrapMarkdown: React.FC<BootstrapMarkdownProps> = ({ markdownContent }) => {
    const components: Components = {
        h3: ({...props}) => <h3 className="h3 text-light mb-4" {...props} />,
        h4: ({...props}) => <h4 className="h4 text-info mb-3" {...props} />,
        p: ({...props}) => <p className="lead text-light mb-3" {...props} />,
        ul: ({...props}) => <ul className="list-unstyled text-light" {...props} />,
        li: ({...props}) => <li className="mb-2 text-light" {...props} />,
        code: ({...props}) =>             
            <pre className="p-3 bg-dark text-light rounded">
                <code {...props} />
            </pre>        
    };

    return (
        <Container className="my-4">
            <Card bg="dark" text="light">
                <Card.Body>
                    <ReactMarkdown components={components}>
                        {markdownContent}
                    </ReactMarkdown>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default BootstrapMarkdown;