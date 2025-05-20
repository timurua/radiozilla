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
    userId: number;
    playedAudioIds: string[];
    likedAudioIds: string[];
    searchHistory: string[];
    subscribedChannelIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserDTO {
    userId: number;
    firebaseUserId: string;
    name: string | null;
    description: string | null;
    imageUrl: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
    is_enabled: boolean;
}

export interface ActivityLogDTO {
    id: number;
    userId: number | null;
    userGroupId: number | null;
    action: string;
    createdAt: Date;
    ipAddress: string | null;
}