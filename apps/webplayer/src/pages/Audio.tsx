import { AudioPlayer } from '../components/AudioPlayer';
import PlayerScreen from '../components/PlayerScreen';
import { BootstrapBackButton } from '../components/BackButton';
import { useParams } from 'react-router-dom';
import { getAudio } from '../data/firebase';
import { useEffect, useState } from 'react';
import { RZAudio } from '../data/model';

function Audio() { 

  const { audioId } = useParams();  
  const [rzAudio, setRZAudio] = useState<RZAudio|null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      if (!audioId) {
        return;
      }
      const audio = await getAudio(audioId);
      if (audio) {
        setRZAudio(audio)
      }
    };
    fetchAudio();
  }, [audioId]);

  return (
    <PlayerScreen noShowSmallPlayer={true}>
        <div className="mb-3">
            <BootstrapBackButton size="lg"/>
        </div>
      <div>
        <AudioPlayer showExtendedInfo={true} displayAudio={rzAudio}/>
      </div>
    </PlayerScreen>
  );
}

export default Audio;
