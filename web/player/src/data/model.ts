
export class User {
  constructor(
    public email: string,
    public name: string,
    public tags: string[],
  ) { }

}

export enum RedinessStatus {
  Shrinking,
  Expanding,
  Refreshing,
  Ready,
}

export enum PlaybackStatus {
  Idle,
  Playing,
  Completed,
  Cancelled,
}

export enum SourceType {
  Audio,
  Text,
}

export class Playable {
  constructor(
    public id: string,
    public name: string,
    public writer: string,
    public imageUrl: string,
    public audioUrl: string,
    public playbackStatus: PlaybackStatus,
    public readinessStatus: RedinessStatus,
    public tags: string[],
    public sourceType: SourceType,
  ) {
  }
}

export enum LogAction {
  Completed,
  Skipped,
  Paused,
  Shrinked,
  Expanded
}

export class PlayableLog {
  constructor(
    public id: string,
    public startedAt: Date,
    public playableId: string,
    public durationSeconds: number,
    public action: LogAction,
  ) { }
}

export class Channel {
  constructor(
    public id: string,
    public name: string,
    public writer: string,
    public imageUrl: string,
    public url: string,
  ) {
  }
}


export const playList = [
  {
    name: "music - 1",
    writer: "react-modern-audio-player",
    img:
      "https://cdn.pixabay.com/photo/2021/11/04/05/33/dome-6767422_960_720.jpg",
    src: "https://cdn.pixabay.com/audio/2022/08/23/audio_d16737dc28.mp3",
    id: 1
  },
  {
    name: "music - 2",
    writer: "react-modern-audio-player",
    img:
      "https://cdn.pixabay.com/photo/2021/09/06/16/45/nature-6602056__340.jpg",
    src: "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3",
    id: 2
  },
  {
    name: "music - 3",
    writer: "react-modern-audio-player",
    img: "https://cdn.pixabay.com/photo/2022/08/29/08/47/sky-7418364__340.jpg",
    src: "https://cdn.pixabay.com/audio/2022/08/03/audio_54ca0ffa52.mp3",
    id: 3
  },
  {
    name: "music - 4",
    writer: "react-modern-audio-player",
    img:
      "https://cdn.pixabay.com/photo/2015/09/22/01/30/lights-951000__340.jpg",
    src: "https://cdn.pixabay.com/audio/2022/07/25/audio_3266b47d61.mp3",
    id: 4
  },
  {
    name: "music - 5",
    writer: "react-modern-audio-player",
    img: "https://cdn.pixabay.com/photo/2022/08/28/18/03/dog-7417233__340.jpg",
    src: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
    id: 5
  }
];
