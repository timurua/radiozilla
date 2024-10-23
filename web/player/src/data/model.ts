
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
  Preferences = "Preferences"
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
    public createdAt: Date,
    public name: string,
    public writer: string,
    public imageUrl: string,
    public audioUrl: string,
    public playbackStatus: PlaybackStatus,
    public readinessStatus: RedinessStatus,
    public topics: string[],
    public sourceType: SourceType,
    public topicsEmbedding: number[] = [],
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

export class Update {
  constructor(
    public id: string,
    public playableId: string,
  ){}
}

