
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

export class RZAuthor {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public image_url: string,
  ) {
  }

  static fromObject(obj: any, id: string): RZAuthor {
    return new RZAuthor(
      id,
      obj.name,
      obj.description,
      obj.image_url,
    );
  }  
}

export class RZAudio {
  constructor(
    public id: string,
    public created_at: Date,
    public name: string,
    public image_url: string,
    public audio_url: string,
    public topics: string[],
    public author: RZAuthor,
  ) {
  }

  static fromObject(obj: any, id: string, created_at: Date, author: RZAuthor): RZAudio {
    return new RZAudio(
      id,
      created_at,  // Convert to Date object
      obj.name,
      obj.image_url,
      obj.audio_url,
      obj.topics,
      author,
    );
  }
}

export class RZAudioTask {
  constructor(
    public id: string,
    public created_at: Date,
    public name: string,
    public description: string,
    public image_url: string,
    public summary_text: string,
  ) {
  }
}