
export class RZFrontendChannel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public imageUrl: string,
  ) {
  }


  static fromObject(obj: { name: string; description: string; imageUrl: string }, id: string): RZFrontendChannel {
    return new RZFrontendChannel(
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
  NONE = "None",
  AUTH_ANONYMOUS = "AuthAnonymous",
  AUTH_USER = "AuthUser",
  WAITING_EMAIL_VERIFICATION = "WaitingEmailVerification",
}

export interface RZUser {
  id: number;
  firebaseUserId: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null,
  email: string | null,
  is_enabled: boolean,
  createdAt: Date,
  updatedAt: Date,
  userType: RZUserType,
}

export interface RZChannel {
  id: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null,
  isPublic: boolean | null,
  webPageChannelId?: number | null,
  createdAt: Date,
  updatedAt: Date,
}

export interface RZStation {
  id: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null,
  isPublic: boolean | null,
  createdAt: Date,
  updatedAt: Date,
}

export const nobody = (): RZUser => {
  return {
    id: 0,
    firebaseUserId: "",
    name: null,
    description: null,
    imageUrl: null,
    email: null,
    is_enabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userType: RZUserType.NONE
  }
};

export class RZUserData {
  constructor(
    public id: number,
    public createdAt: Date,
    public updatedAt: Date,
    public subscribedChannelIds: string[],
    public likedAudioIds: string[],
    public playedAudioIds: string[],
    public searchHistory: string[],
    public lastActiveAt: Date | null = null,
  ) {
  }

  static empty(): RZUserData {
    return new RZUserData(
      0,
      new Date(),
      new Date(),
      [],
      [],
      [],
      [],
      null
    );
  }

  clone(): RZUserData {
    return new RZUserData(
      this.id,
      this.createdAt,
      this.updatedAt,
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
    public channel: RZFrontendChannel,
    public audioText: string,
    public durationSeconds: number,
    public webUrl: string,
    public publishedAt: Date | null,
  ) {
  }

  static fromObject(obj: { name: string; audioUrl: string; imageUrl: string, topics: string[], audioText: string, durationSeconds: number, webUrl: string, publishedAt: Date | null }, id: string, createdAt: Date, author: RZAuthor, channel: RZFrontendChannel): RZAudio {
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