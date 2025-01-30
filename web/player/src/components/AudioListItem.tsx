import { useEffect, useState } from 'react';
import { Badge, Image, ListGroup } from "react-bootstrap";
import { BsCheckCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { RZAudio } from "../data/model";
import { storageUtils } from '../firebase';
import { useAudio } from "../providers/AudioProvider";
import logger from '../utils/logger';
import { useRecoilValue } from 'recoil';
import { userDataState } from '../state/userData';

export function AudioListItem({ rzAudio }: { rzAudio: RZAudio }) {
    const { rzAudio: currentPlayable } = useAudio();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const userData = useRecoilValue(userDataState);

    const { play } = useAudio();

    function playAudio(audio: RZAudio) {
        play(audio);
    }

    function openAudio(audio: RZAudio) {
        navigate(`/audio/${audio.id}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function openChannel(audio: RZAudio, e: React.MouseEvent) {
        navigate(`/channel/${audio.channel.id}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
        e.stopPropagation();
    }

    function onAudioClick(isPlaying: boolean, rzAudio: RZAudio) {
        if (isPlaying) {
            openAudio(rzAudio);
        } else {
            playAudio(rzAudio);
        }
    }

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const url = await storageUtils.toDownloadURL(rzAudio.imageUrl);
                setImageUrl(url);
            } catch (error) {
                logger.error('Error fetching image URL from Firebase Storage:', error);
            }
        };

        fetchImage();
    }, [rzAudio?.imageUrl, setImageUrl]);

    const isPlaying = !!(currentPlayable && currentPlayable.id === rzAudio.id);

    return (
        <ListGroup.Item key={rzAudio.id} className={"no-select d-flex align-items-center text-light " + (isPlaying ? "bg-secondary rounded" : "bg-dark")} onClick={() => onAudioClick(isPlaying, rzAudio)}>
            <Image src={imageUrl} rounded className="me-3 text-light" width={50} height={50} />
            <div>
                {rzAudio.name} {
                rzAudio.publishedAt ?
                " - " + new Date(rzAudio.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }): ''
                }
                <div className='relative inline-flex items-center' onClick={(e) => openChannel(rzAudio, e)}>
                    <Badge bg="secondary" className="pl-2 user-select-none">
                        {rzAudio.channel.name}
                    </Badge>
                    {userData?.subscribedChannelIds.includes(rzAudio.channel.id) &&
                        <BsCheckCircleFill style={{ 
                            position: 'relative',
                            top: '-8px',
                            right: '4px'
                          }} size={10}  />                        
                    }
                </div>
            </div>
        </ListGroup.Item>);
}
