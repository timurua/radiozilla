export interface FrontendAuthorDTO {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FrontendChannelDTO {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    sourceUrls: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface FrontendAudioDTO {
    id: string;
    normalizedUrl: string;
    title: string;
    description: string;
    audioUrl: string;
    imageUrl: string;
    webUrl: string;
    topics: string[];
    audioText: string;
    durationSeconds: number;
    authorId: string | null;
    channelId: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface FrontendUserDTO {
    userId: string;
    displayName: string | null;
    email: string | null;
    imageUrl: string | null;
    createdAt: Date | null;
    playedAudioIds: string[];
    likedAudioIds: string[];
    searchHistory: string[];
    subscribedChannelIds: string[];
}