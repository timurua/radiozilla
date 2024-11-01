
export class User {
  constructor(
    public email: string,
    public name: string,
    public preferences: string[] = [],
    public preferencesEmbedding: number[] = []
  ) { }

}

export enum PlayableSorting {
  Date = "Date",
  Topic = "Topic",
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

export class AudioSource {

}

export class Audio {
  constructor(
    public id: string,
    public created_at: Date,
    public name: string,
    public author: string,
    public image_url: string,
    public audio_url: string,
    public topics: string[],
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

export class ChannelType {
  constructor(
    public id: string,
    public name: string,
    public writer: string,
    public imageUrl: string,
    public url: string,
  ) {
  }  
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

export class Update {
  constructor(
    public id: string,
    public playableId: string,
  ){}
}

