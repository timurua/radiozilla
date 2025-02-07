import { useEffect, useState } from 'react';
import { Image, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getChannel } from '../data/firebase';
import { RZChannel } from '../data/model';
import { storageUtils } from '../firebase';
import logger from '../utils/logger';
import { ChannelSubscribeButton } from './ChannelSubscribeButton';

export function ChannelListItem({ channelId }: { channelId: string }) {
    const navigate = useNavigate();
    const [channel, setChannel] = useState<RZChannel | null>(null);
    const handleClick = () => {
        navigate(`/channel/${channelId}`);
        window.scrollTo({ top: 0, behavior: 'instant' });

    };
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchChannel = async () => {
            try {
                const channel = await getChannel(channelId);
                setChannel(channel);
                const url = await storageUtils.toDownloadURL(channel.imageUrl);
                setImageUrl(url);
            } catch (error) {
                logger.error('Error fetching image URL from Firebase Storage:', error);
            }
        };
        fetchChannel();
    }, [channel?.imageUrl, channelId, setImageUrl]);

    return (
        <ListGroup.Item onClick={handleClick} key={channelId} className={"no-select d-flex align-items-center text-light bg-dark"}>
            {channel === null ? null : <>
                <Image src={imageUrl} rounded className="me-3 text-light" width={50} height={50}
                    style={{ filter: 'brightness(0) invert(1)' }}/>
                <div>
                    <div className='small'>{channel.name}</div>
                    <div className='small'>{channel.description}</div>
                    <div><ChannelSubscribeButton channelId={channel.id} /></div>
                </div>
            </>}
        </ListGroup.Item>
    );
};

export default ChannelListItem;