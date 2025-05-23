import { RZUserType } from "@/components/webplayer/data/model";

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
    createdAt: Date;
    updatedAt: Date;
    playedAudioIds: string[];
    likedAudioIds: string[];
    searchHistory: string[];
    subscribedChannelIds: string[];
}

export interface ActivityLogDTO {
    id: number;
    userId: number | null;
    userGroupId: number | null;
    action: string;
    createdAt: Date;
    ipAddress: string | null;
}