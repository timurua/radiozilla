
'use client';

import { useEffect, useState } from 'react';
import { Image, ListGroup } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { getChannel } from '@/lib/db/client';
import { RZFrontendChannel } from '@/components/webplayer/data/model';
import { storageUtils } from '@/lib/firebase';
import logger from '@/components/webplayer/utils/logger';
import { ChannelSubscribeButton } from './ChannelSubscribeButton';

export function ChannelListItem({ channelId }: { channelId: string }) {
    const router = useRouter();
    const [channel, setChannel] = useState<RZFrontendChannel | null>(null);
    const handleClick = () => {
        router.push(`/webplayer/channel/${channelId}`);
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
                <Image alt="Channel cover" src={imageUrl} rounded className="me-3 text-light" width={50} height={50}
                    style={{ filter: 'brightness(0) invert(1)' }} />
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