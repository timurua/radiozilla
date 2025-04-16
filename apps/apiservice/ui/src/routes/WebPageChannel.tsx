import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FAWebPageChannel } from '../api';
import Client from '../client';
import Details from '../components/channel/Details';
import Pages from '../components/channel/Pages';
import Scraping from '../components/channel/Scraping';
import Spinner from '../components/Spinner';

const WebPageChannel: React.FC = () => {
    let { channelId, activeTab } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [channel, setChannel] = React.useState<null | FAWebPageChannel>(null);

    if (!activeTab) {
        activeTab = 'details';
    }

    const handleTabSelect = (tab: string | null) => {
        if (tab) {
            navigate(`/web-page-channel/${channelId}/${tab}`);
        }
    };

    useEffect(() => {
        const fetchChannel = async () => {
            if (!channelId) {
                return;
            }
            const response = await Client.getChannelByIdApiV1WebPageChannelByIdGet(channelId);
            if (response.data) {
                setChannel(response.data);
            }
            setLoading(false);
        };

        fetchChannel();
    }, [channelId]);


    return (
        loading ? (
            <Spinner text='Loading channel...' />
        ) : !channel ? (
            <div className="mt-5">
                <h3>Channel not found</h3>
            </div>
        ) : (
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col>
                        <Tabs
                            id="channel-tabs"
                            activeKey={activeTab}
                            onSelect={handleTabSelect}
                            className="mb-3"
                        >
                            <Tab eventKey="details" title="Details">
                                {activeTab === 'details' && <Details channel={channel} />}
                            </Tab>
                            <Tab eventKey="pages" title="Pages">
                                {activeTab === 'pages' && <Pages channel={channel} />}
                            </Tab>
                            <Tab eventKey="scraping" title="Scraping">
                                {activeTab === 'scraping' && <Scraping channel={channel} />}
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        ));
};

export default WebPageChannel;