import {useEffect, useState } from 'react';
import { Image, ListGroup } from "react-bootstrap";
import { RZAudio } from "../data/model";
import { storageUtils } from '../firebase';
import { useAudio } from "../providers/AudioProvider";
import logger from '../utils/logger';
import { useNavigate } from 'react-router-dom';

export function AudioListItem({ rzAudio }: { rzAudio: RZAudio }) {
    const { rzAudio: currentPlayable } = useAudio();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const { play } = useAudio();

    function playAudio(audio: RZAudio) {
        play(audio);
    }

    function openAudio(audio: RZAudio) {
        navigate(`/audio/${audio.id}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
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
                <div className='small'>{rzAudio.name}</div>
                <div className='small'>{rzAudio.channel.name}</div>
            </div>
        </ListGroup.Item>);
}
