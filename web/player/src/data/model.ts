
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
    public imageUrl: string,
  ) {
  }

  static fromObject(obj: any, id: string): RZAuthor {
    return new RZAuthor(
      id,
      obj.name,
      obj.description,
      obj.imageUrl,
    );
  }  
}


export class RZSummarization {
  constructor(
    public id: string,
    public length: string, // Options: "short", "medium", "long"
    public tone: string, // Options: "formal", "informal", "neutral"
    public focus: string, // Options: list of areas of focus (e.g., "key points", "data", "examples")
    public detaileLevel: string, // Options: "low", "medium", "high"
  ) {
  }

  static fromObject(obj: any, id: string): RZSummarization {
    return new RZSummarization(
      id,
      obj.length,
      obj.tone,
      obj.focus,      
      obj.detaileLevel,
    );
  }  
}

export class RZAudio {
  constructor(
    public id: string,
    public createdAt: Date,
    public name: string,
    public imageUrl: string,
    public audioUrl: string,
    public topics: string[],
    public author: RZAuthor,
  ) {
  }

  static fromObject(obj: any, id: string, createdAt: Date, author: RZAuthor): RZAudio {
    return new RZAudio(
      id,
      createdAt,  // Convert to Date object
      obj.name,
      obj.imageUrl,
      obj.audioUrl,
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
    public imageUrl: string,
    public sourceText: string,
  ) {
  }
}