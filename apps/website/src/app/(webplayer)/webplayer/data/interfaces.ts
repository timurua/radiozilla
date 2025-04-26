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
    name: string;
    audioUrl: string;
    imageUrl: string;
    topics: string[];
    audioText: string;
    durationSeconds: number;
    webUrl: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}