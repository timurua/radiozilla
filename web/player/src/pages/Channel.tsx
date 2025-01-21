import { AudioPlayer } from '../components/AudioPlayer';
import PlayerScreen from '../components/PlayerScreen';
import { BootstrapBackButton } from '../components/BackButton';

function Channel() { 

  return (
    <PlayerScreen noShowSmallPlayer={true}>
        <div className="mb-3">
            <BootstrapBackButton size="lg"/>
        </div>
      <div>
        <AudioPlayer showExtendedInfo={true}/>
      </div>
    </PlayerScreen>
  );
}

export default Channel;
