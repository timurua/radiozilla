'use server';

import { desc } from 'drizzle-orm';
import { TfIdfDocument } from '../tfidf/types';
import logger from '../utils/logger';
import { PlayableFeedMode } from "./model";

import { db } from '@/lib/db/drizzle';
import {
    FrontendAudio,
    frontendAudios,
    frontendAuthors,
    frontendChannels,
    frontendUsers,
    NewFrontendUser
} from '@/lib/db/schema';
import { eq, lte } from 'drizzle-orm';
import { FrontendAudioDTO, FrontendAuthorDTO, FrontendChannelDTO, FrontendUserDTO } from './interfaces';


export const getAuthorAction = async (id: string): Promise<FrontendAuthorDTO> => {
    const [dbAuthor] = await db
        .select()
        .from(frontendAuthors)
        .where(
            eq(frontendAuthors.normalizedUrlHash, id)
        )
        .limit(1);



    if (dbAuthor) {
        return {
            id: dbAuthor.normalizedUrlHash,
            name: dbAuthor.name || '',
            description: dbAuthor.description || '',
            imageUrl: dbAuthor.imageUrl || '',
            createdAt: dbAuthor.createdAt,
            updatedAt: dbAuthor.updatedAt
        };
    } else {
        logger.error(`No author found with ID: ${id}`);
        throw new Error(`No author found with ID: ${id}`);
    }
}

export const getAllChannelIdsAction = async (): Promise<string[]> => {
    const dbChannelIds = await db.select({
        id: frontendChannels.normalizedUrlHash,
    })
        .from(frontendChannels)
    return dbChannelIds.map((dbChannelId) => dbChannelId.id)
}

export const getChannelAction = async (id: string): Promise<FrontendChannelDTO> => {
    const [dbChannel] = await db
        .select()
        .from(frontendChannels)
        .where(
            eq(frontendChannels.normalizedUrlHash, id)
        )
        .limit(1);

    if (dbChannel) {
        return {
            id: dbChannel.normalizedUrlHash,
            name: dbChannel.name || '',
            description: dbChannel.description || '',
            imageUrl: dbChannel.imageUrl || '',
            sourceUrls: dbChannel.sourceUrls || [],
            createdAt: dbChannel.createdAt,
            updatedAt: dbChannel.updatedAt
        };
    } else {
        logger.error(`No author found with ID: ${id}`);
        throw new Error(`No author found with ID: ${id}`);
    }
}


export const getUserDataAction = async (id: string): Promise<FrontendUserDTO> => {

    if (!id) {
        return {
            userId: id,
            displayName: null,
            email: null,
            imageUrl: null,
            createdAt: null,
            playedAudioIds: [],
            likedAudioIds: [],
            searchHistory: [],
            subscribedChannelIds: []
        };
    }

    const dbUsers = await db.select({
        userId: frontendUsers.userId,
        displayName: frontendUsers.displayName,
        email: frontendUsers.email,
        imageUrl: frontendUsers.imageUrl,
        createdAt: frontendUsers.createdAt,
        playedAudioIds: frontendUsers.playedAudioIds,
        likedAudioIds: frontendUsers.likedAudioIds,
        searchHistory: frontendUsers.searchHistory,
        subscribedChannelIds: frontendUsers.subscribedChannelIds
    }).from(frontendUsers).where(eq(frontendUsers.userId, id)).limit(1);


    if (dbUsers.length > 0) {
        return {
            userId: id,
            displayName: dbUsers[0].displayName || null,
            email: dbUsers[0].email || null,
            imageUrl: dbUsers[0].imageUrl || null,
            createdAt: dbUsers[0].createdAt,
            playedAudioIds: Array.isArray(dbUsers[0].playedAudioIds) ? dbUsers[0].playedAudioIds : [],
            likedAudioIds: Array.isArray(dbUsers[0].likedAudioIds) ? dbUsers[0].likedAudioIds : [],
            searchHistory: Array.isArray(dbUsers[0].searchHistory) ? dbUsers[0].searchHistory : [],
            subscribedChannelIds: Array.isArray(dbUsers[0].subscribedChannelIds) ? dbUsers[0].subscribedChannelIds : []
        };
    } else {
        logger.info(`No user found with ID: ${id}`);
        return {
            userId: id,
            displayName: null,
            email: null,
            imageUrl: null,
            createdAt: null,
            playedAudioIds: [],
            likedAudioIds: [],
            searchHistory: [],
            subscribedChannelIds: []
        };

    }
}

export const saveUserDataAction = async (userData: FrontendUserDTO) => {
    const newUser: NewFrontendUser = {
        userId: userData.userId,
        displayName: userData.displayName || null,
        email: userData.email || null,
        imageUrl: userData.imageUrl || null,
        createdAt: userData.createdAt,
        playedAudioIds: userData.playedAudioIds || [],
        likedAudioIds: userData.likedAudioIds || [],
        searchHistory: userData.searchHistory || [],
        subscribedChannelIds: userData.subscribedChannelIds || []
    };
    await db
        .insert(frontendUsers)
        .values(newUser)
        .onConflictDoUpdate({
            target: frontendUsers.userId,
            set: {
                displayName: userData.displayName || null,
                email: userData.email || null,
                imageUrl: userData.imageUrl || null,
                createdAt: userData.createdAt,
                playedAudioIds: userData.playedAudioIds || [],
                likedAudioIds: userData.likedAudioIds || [],
                searchHistory: userData.searchHistory || [],
                subscribedChannelIds: userData.subscribedChannelIds || []
            }
        });

}

function dbAudioToDTO(dbAudio: FrontendAudio): FrontendAudioDTO {
    return {
        id: dbAudio.normalizedUrlHash,
        normalizedUrl: dbAudio.normalizedUrl,
        title: dbAudio.title || '',
        description: dbAudio.description || '',
        imageUrl: dbAudio.imageUrl || '',
        audioUrl: dbAudio.audioUrl || '',
        webUrl: dbAudio.webUrl || '',
        topics: dbAudio.topics || [],
        audioText: dbAudio.audioText || '',
        durationSeconds: dbAudio.durationSeconds || 0,
        authorId: dbAudio.authorId || null,
        channelId: dbAudio.channelId || null,
        publishedAt: dbAudio.publishedAt || null,
        createdAt: dbAudio.createdAt,
        updatedAt: dbAudio.updatedAt
    };
}

// Modify getAudio with caching
export const getAudioAction = async (id: string): Promise<FrontendAudioDTO> => {
    const [dbAudio] = await db
        .select()
        .from(frontendAudios)
        .where(
            eq(frontendAudios.normalizedUrlHash, id)
        )
        .limit(1);

    if (dbAudio) {
        return dbAudioToDTO(dbAudio);
    } else {
        logger.error(`No audio found with ID: ${id}`);
        throw new Error(`No audio found with ID: ${id}`);
    }
}

export const getAudioListForChannelAction = async (channelId: string): Promise<FrontendAudioDTO[]> => {

    const dbAudios = await db
        .select()
        .from(frontendAudios)
        .where(
            eq(frontendAudios.channelId, channelId)
        )
    return dbAudios.map((dbAudio) => dbAudioToDTO(dbAudio))
}

export const getAudioPageAction = async (startAfterPublishedAt: Date | null, pageSize: number): Promise<FrontendAudioDTO[]> => {

    const dbAudios = await db
        .select()
        .from(frontendAudios)
        .where(
            lte(frontendAudios.publishedAt, startAfterPublishedAt!)
        )
        .orderBy(desc(frontendAudios.publishedAt))
        .limit(pageSize);
    return dbAudios.map((dbAudio) => dbAudioToDTO(dbAudio))
}


export const getSearchDocumentsAction = async (): Promise<TfIdfDocument[]> => {

    const dbAudios = await db
        .select({
            normalizedUrlHash: frontendAudios.normalizedUrlHash,
            title: frontendAudios.title
        })
        .from(frontendAudios)

    return dbAudios.map(dbAudio => ({
        docId: dbAudio.normalizedUrlHash,
        text: dbAudio.title || ''
    }));
}

export const getFeedAudioListAction = async (feedMode: PlayableFeedMode, subscribedChannelIds: string[]): Promise<FrontendAudioDTO[]> => {

    let dbAudios = await db.select()
        .from(frontendAudios)
        .orderBy(desc(frontendAudios.publishedAt))

    if (feedMode == PlayableFeedMode.Subscribed) {
        const subscribedChannelIdsSet = new Set(subscribedChannelIds);
        dbAudios = dbAudios.filter(dbAudio => subscribedChannelIdsSet.has(dbAudio.channelId!));
    }

    return dbAudios.map(dbAudio => dbAudioToDTO(dbAudio));
}



