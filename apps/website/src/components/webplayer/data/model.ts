
export class RZChannel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public imageUrl: string,
  ) {
  }


  static fromObject(obj: { name: string; description: string; imageUrl: string }, id: string): RZChannel {
    return new RZChannel(
      id,
      obj.name,
      obj.description,
      obj.imageUrl,
    );
  }
}

export enum PlayableFeedMode {
  Latest = "Latest",
  Subscribed = "Subscribed",
}

export enum RZUserType {
  NOBODY = "Nobody",
  ANONYMOUS = "Anonymous",
  USER = "User",
}

export class RZUser {
  constructor(
    public id: string,
    public name: string,
    public imageUrl: string,
    public email: string,
    public userType: RZUserType,
  ) {
  }
}

export class RZUserData {
  constructor(
    public id: string | null,
    public displayName: string | null,
    public email: string | null,
    public imageURL: string | null,
    public createdAt: Date | null,
    public subscribedChannelIds: string[],
    public likedAudioIds: string[],
    public playedAudioIds: string[],
    public searchHistory: string[],
    public lastActiveAt: Date | null = null,
  ) {
  }

  static empty(): RZUserData {
    return new RZUserData(
      null,
      null,
      null,
      null,
      null,
      [],
      [],
      [],
      [],
      null,
    );
  }

  clone(): RZUserData {
    return new RZUserData(
      this.id,
      this.displayName,
      this.email,
      this.imageURL,
      this.createdAt,
      this.subscribedChannelIds,
      this.likedAudioIds,
      this.playedAudioIds,
      this.searchHistory,
      this.lastActiveAt,
    );
  }
}

export class RZAuthor {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public imageUrl: string,
  ) {
  }

  static fromObject(obj: { name: string, description: string, imageUrl: string }, id: string): RZAuthor {
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

  static fromObject(obj: { length: string, tone: string, focus: string, detaileLevel: string }, id: string): RZSummarization {
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
    public channel: RZChannel,
    public audioText: string,
    public durationSeconds: number,
    public webUrl: string,
    public publishedAt: Date | null,
  ) {
  }

  static fromObject(obj: { name: string; audioUrl: string; imageUrl: string, topics: string[], audioText: string, durationSeconds: number, webUrl: string, publishedAt: Date | null }, id: string, createdAt: Date, author: RZAuthor, channel: RZChannel): RZAudio {
    return new RZAudio(
      id,
      createdAt,  // Convert to Date object
      obj.name,
      obj.imageUrl,
      obj.audioUrl,
      obj.topics,
      author,
      channel,
      obj.audioText,
      obj.durationSeconds,
      obj.webUrl,
      obj.publishedAt
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