import { AudioList } from '../components/AudioList';
import { PlayableSortingSelector } from '../components/PlayableSortingSelector';
import PlayerScreen from '../components/PlayerScreen';

function Feed() {
  
  return (
    <PlayerScreen>
      <div>
        <PlayableSortingSelector />        
      </div>
      <AudioList/>
    </PlayerScreen>
  );
}

export default Feed;
