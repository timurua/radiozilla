import React, { useEffect, useState } from 'react';
import { Card, Image, ListGroup } from 'react-bootstrap';
import { RZChannel } from '../data/model';
import { storageUtils } from '../firebase';
import logger from '../utils/logger';

interface ChannelListItemProps {
    channel: RZChannel;
    onClick?: (channel: RZChannel) => void;
    selected?: boolean;
}

export const ChannelListItem: React.FC<ChannelListItemProps> = ({
    channel,
    onClick = null,
}) => {
    const handleClick = () => {
        onClick?.(channel);
    };

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const url = await storageUtils.toDownloadURL(channel.imageUrl);
                setImageUrl(url);
            } catch (error) {
                logger.error('Error fetching image URL from Firebase Storage:', error);
            }
        };

        fetchImage();
    }, [channel?.imageUrl, setImageUrl]);

    return (
        <ListGroup.Item onClick={handleClick} key={channel.id} className={"no-select d-flex align-items-center text-light bg-dark"}>
            <Card className='bg-dark text-white border-secondary no-select d-flex flex-row align-items-center'>
                {imageUrl && <Image src={imageUrl} rounded className="m-3 text-light" width={50} height={50} />}
                <Card.Body>
                    <Card.Title>{channel.name}</Card.Title>
                    <Card.Text>{channel.description}</Card.Text>
                </Card.Body>
            </Card>
        </ListGroup.Item>
    );
};

export default ChannelListItem;