import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { FAWebPage, FAWebPageChannel } from '../../api';
import Client from '../../client';
import Spinner from '../Spinner';

interface DetailsProps {
    channel: FAWebPageChannel;
}

const Contents: React.FC<DetailsProps> = ({ channel }) => {

    const [loading, setLoading] = useState(false);
    const [pages, setPages] = useState<Array<FAWebPage>>([]);

    useEffect(() => {
        const fetchChannel = async () => {
            const response = await Client.getWebPagesByChannelIdApiV1GetWebPagesByChannelIdGet(channel.normalized_url_hash);
            if (response.data) {
                setPages(response.data);
            }
            setLoading(false);
        };

        fetchChannel();
    }, [channel]);


    return (
        loading ? (
            <Spinner text='Loading pages...' />
        ) : pages.length === 0 ? (
            <div className="mt-5">
                <h3>Pages not found</h3>
            </div>
        ) : (
            <Container className="mt-5">
                <ListGroup>
                    {pages.map((page, index) => (
                        <ListGroup.Item key={index}>
                            {page.url}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Container>
        ));

};

export default Contents;