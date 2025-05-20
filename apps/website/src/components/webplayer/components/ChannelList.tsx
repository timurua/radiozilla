import React from 'react';
import { ListGroup } from 'react-bootstrap';
import ChannelListItem from './ChannelListItem';
import { getAllChannelIds } from '@/lib/db/client';

interface ChannelListProps {
    channelIds: string[];
}

export const ChannelList: React.FC<ChannelListProps> = ({ channelIds }) => {
    return (
        <ListGroup variant="flush" className='bg-dark text-white w-100'>
            {channelIds.length === 0 ? (
                <ListGroup.Item className='bg-dark text-white'>Subscribe to channels to get the latest updates</ListGroup.Item>
            ) : channelIds.map((channelId) => (
                <ChannelListItem key={channelId} channelId={channelId} />
            ))}
        </ListGroup>

    );
};

export function AllChannelList() {
    const [channelIds, setChannelIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        const fetchChannels = async () => {
            // Fetch the channel ids from the server
            const channelIds = await getAllChannelIds();
            setChannelIds(channelIds);
        };
        fetchChannels();
    }, []);
    return (
        channelIds.length === 0 ? (<>No Channels</>) : <ChannelList channelIds={channelIds} />
    );
}
