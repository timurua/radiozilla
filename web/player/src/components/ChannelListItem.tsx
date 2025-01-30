import { useEffect, useState } from 'react';
import { Image, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { RZChannel } from '../data/model';
import { storageUtils } from '../firebase';
import logger from '../utils/logger';

export function ChannelListItem({ channel }: { channel: RZChannel }) {
    const navigate = useNavigate();
    const handleClick = () => {        
        navigate(`/channel/${channel.id}`);
        window.scrollTo({ top: 0, behavior: 'instant' });

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
            <Image src={imageUrl} rounded className="me-3 text-light" width={50} height={50} />
            <div>
                <div className='small'>{channel.name}</div>
                <div className='small'>{channel.description}</div>
            </div>
        </ListGroup.Item>
    );
};

export default ChannelListItem;