import "./styles.css";
import AudioPlayer, {
  ActiveUI,
  InterfaceGridTemplateArea,
  PlayerPlacement,
  PlayListPlacement,
  ProgressUI,
  VolumeSliderPlacement
} from "react-modern-audio-player";
import { useState } from "react";
import { playList } from "./playList";
import Editor from "./Editor";

export default function App() {
  const [progressType, setProgressType] = useState<ProgressUI>("waveform");
  const [playerPlacement, setPlayerPlacement] = useState<PlayerPlacement>(
    "bottom-left"
  );
  const [interfacePlacement, setInterfacePlacement] = useState<
    InterfaceGridTemplateArea
  >();
  const [playListPlacement, setPlayListPlacement] = useState<PlayListPlacement>(
    "bottom"
  );
  const [volumeSliderPlacement, setVolumeSliderPlacement] = useState<
    VolumeSliderPlacement
  >();
  const [theme, setTheme] = useState<"dark" | "light" | undefined>();
  const [width, setWidth] = useState("100%");
  const [activeUI, setActiveUI] = useState<ActiveUI>({ all: true });

  return (
    <div className="App">
      <h3>React Modern Audio Player</h3>

      <div className="player-container">
        <AudioPlayer
          playList={playList}
          activeUI={{
            ...activeUI,
            progress: progressType
          }}
          placement={{
            player: playerPlacement,
            interface: {
              templateArea: interfacePlacement
            },
            playList: playListPlacement,
            volumeSlider: volumeSliderPlacement
          }}
          rootContainerProps={{
            colorScheme: theme,
            width
          }}
        />
      </div>

      <Editor
        setPlayerPlacement={setPlayerPlacement}
        setProgressType={setProgressType}
        setInterfacePlacement={setInterfacePlacement}
        setPlayListPlacement={setPlayListPlacement}
        setVolumeSliderPlacement={setVolumeSliderPlacement}
        setTheme={setTheme}
        setActiveUI={setActiveUI}
        setWidth={setWidth}
      />
    </div>
  );
}
