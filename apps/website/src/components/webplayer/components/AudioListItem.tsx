'use client';

import { useEffect, useState } from 'react';
import { Badge, Image, ListGroup } from "react-bootstrap";
import { BsCheckCircleFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { observer } from "mobx-react-lite";
import { useAudio } from "../providers/AudioProvider";
import { userDataStore } from "../state/userData";
import logger from '../utils/logger';
import { RZAudio } from "../data/model";
import { storageUtils } from '../../../lib/firebase';

export const AudioListItem = observer(function AudioListItem({ rzAudio, onClick }: { rzAudio: RZAudio, onClick?: (audio: RZAudio) => void }) {
    const { rzAudio: currentPlayable } = useAudio();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const router = useRouter();
    const userDataSubscribedChannelIds = userDataStore.subscribedChannelIds;
    const userDataPlayedAudioIds = userDataStore.playedAudioIds;

    const { play } = useAudio();

    function playAudio(audio: RZAudio) {
        play(audio);
    }

    function openAudio(audio: RZAudio) {
        router.push(`/webplayer/audio/${audio.id}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function openChannel(audio: RZAudio, e: React.MouseEvent) {
        router.push(`/webplayer/channel/${audio.channel.id}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
        e.stopPropagation();
    }

    function onAudioClick(isPlaying: boolean, rzAudio: RZAudio) {
        if (onClick) {
            onClick(rzAudio);
        }
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
            <div className="no-select d-flex align-items-center text-light me-3 flex-grow-0">
                <Image alt="Audio cover" src={imageUrl} rounded className="flex-grow-0" width={50} height={50} />
                {userDataPlayedAudioIds.includes(rzAudio.id) &&
                    <div style={{ position: 'relative' }}>
                        <BsCheckCircleFill style={{
                            position: 'absolute',
                            top: '-15px',
                            left: '-40px',
                            opacity: 0.6
                        }} size={30} />
                    </div>
                }
            </div>
            <div className='flex-grow-1'>
                {rzAudio.name} {
                    rzAudio.publishedAt ?
                        " - " + new Date(rzAudio.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
                }
                <div className='relative inline-flex items-center' onClick={(e) => openChannel(rzAudio, e)}>
                    <Badge bg="secondary" className="pl-2 user-select-none">
                        {rzAudio.channel.name}
                    </Badge>
                    {userDataSubscribedChannelIds.includes(rzAudio.channel.id) &&
                        <BsCheckCircleFill style={{
                            position: 'relative',
                            top: '-8px',
                            right: '4px'
                        }} size={10} />
                    }
                </div>
            </div>
        </ListGroup.Item>
    );
});
