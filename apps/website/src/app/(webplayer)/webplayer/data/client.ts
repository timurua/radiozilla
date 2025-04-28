'use client';

import { PlayableFeedMode, RZAudio, RZAuthor, RZChannel, RZUserData, } from "./model";
import { TfIdfDocument } from '../tfidf/types';
import logger from '../utils/logger';
import { LRUCache } from 'lru-cache';
import { getAllChannelIdsAction, getAudioAction, getAudioListForChannelAction, getAuthorAction, getChannelAction, getFeedAudioListAction, getSearchDocumentsAction, getUserDataAction, saveUserDataAction } from './actions';
import { FrontendAudioDTO } from './interfaces';

// Add cache instances
const audioCache = new LRUCache<string, RZAudio>({
    max: 10000, // Maximum number of audios in cache
    ttl: 5 * 60 * 1000 // 5 minute expiration
});

const authorCache = new LRUCache<string, RZAuthor>({
    max: 100, // Maximum number of authors in cache  
    ttl: 15 * 60 * 1000 // 15 minute expiration
});

const channelCache = new LRUCache<string, RZChannel>({
    max: 100, // Maximum number of channels in cache
    ttl: 15 * 60 * 1000 // 15 minute expiration  
});

// Modify getAuthor to use cache
export const getAuthor = async (id: string): Promise<RZAuthor> => {
    const cached = authorCache.get(id);
    if (cached) {
        return cached;
    }
    const authorDTO = await getAuthorAction(id);

    if (authorDTO) {
        const author = new RZAuthor(
            id,
            authorDTO.name || '',
            authorDTO.description || '',
            authorDTO.imageUrl || ''
        );
        authorCache.set(id, author);
        return author;
    } else {
        logger.error(`No author found with ID: ${id}`);
        throw new Error(`No author found with ID: ${id}`);
    }
}

export const getUserData = async (id: string): Promise<RZUserData> => {
    const userDataDTO = await getUserDataAction(id);
    if (!userDataDTO) {
        logger.error(`No user data found with ID: ${id}`);
        throw new Error(`No user data found with ID: ${id}`);
    }
    return new RZUserData(
        id,
        userDataDTO.displayName || null,
        userDataDTO.email || null,
        userDataDTO.imageUrl || null,
        userDataDTO.createdAt,
        userDataDTO.subscribedChannelIds || [],
        userDataDTO.likedAudioIds || [],
        userDataDTO.playedAudioIds || [],
        userDataDTO.searchHistory || []
    );
}

export const saveUserData = async (userData: RZUserData) => {
    await saveUserDataAction({
        userId: userData.id || '',
        displayName: userData.displayName || null,
        email: userData.email || null,
        imageUrl: userData.imageURL || null,
        createdAt: userData.createdAt,
        subscribedChannelIds: userData.subscribedChannelIds || [],
        likedAudioIds: userData.likedAudioIds || [],
        playedAudioIds: userData.playedAudioIds || [],
        searchHistory: userData.searchHistory || []
    });
}

// Modify getChannel with caching
export const getChannel = async (id: string): Promise<RZChannel> => {
    const cached = channelCache.get(id);
    if (cached) {
        return cached;
    }

    const channelDTO = await getChannelAction(id);
    if (!channelDTO) {
        logger.error(`No channel found with ID: ${id}`);
        throw new Error(`No channel found with ID: ${id}`);
    }

    const channel = new RZChannel(
        id,
        channelDTO.name || '',
        channelDTO.description || '',
        channelDTO.imageUrl || ''
    );
    channelCache.set(id, channel);
    return channel;
}

export const getChannels = async (ids: string[]): Promise<RZChannel[]> => {
    const channels = await Promise.all(ids.map(async (id) => {
        return getChannel(id);
    }));
    return channels;
}

export const getAllChannelIds = async (): Promise<string[]> => {
    return await getAllChannelIdsAction();
}

export async function audioFromDTO(dto: FrontendAudioDTO): Promise<RZAudio | null> {

    const author = await getAuthor(dto.authorId || '');
    const channel = await getChannel(dto.channelId || '');

    return new RZAudio(
        dto.id,
        dto.createdAt,
        dto.title,
        dto.imageUrl,
        dto.audioUrl,
        dto.topics,
        author,
        channel,
        dto.audioText,
        dto.durationSeconds,
        dto.webUrl,
        dto.publishedAt
    );
}

// Modify getAudio with caching
export const getAudio = async (id: string): Promise<RZAudio | null> => {
    const cached = audioCache.get(id);
    if (cached) {
        return cached;
    }

    const audioDTO = await getAudioAction(id);
    if (!audioDTO) {
        logger.error(`No audio found with ID: ${id}`);
        throw new Error(`No audio found with ID: ${id}`);
    }

    const audio = await audioFromDTO(audioDTO);
    if (!audio) {
        return null;
    }
    audioCache.set(id, audio);
    return audio;
}


export const getAudioListForChannel = async (channelId: string): Promise<RZAudio[]> => {
    const audioDTOs = await getAudioListForChannelAction(channelId);
    return (await Promise.all(audioDTOs.map(async (dto) => {
        return await audioFromDTO(dto);
    }))).filter((audio): audio is RZAudio => audio !== null);
}

export const getSearchDocuments = async (): Promise<TfIdfDocument[]> => {
    const docs = await getSearchDocumentsAction()
    return docs;
}

export const getAudioListByIds = async (ids: string[]): Promise<RZAudio[]> => {
    const audios = await Promise.all(ids.map(async (id) => {
        try {
            return await getAudio(id);
        } catch {
            return null;
        }
    }));
    return audios.filter((audio): audio is RZAudio => audio !== null);
}

export const getFeedAudioList = async (feedMode: PlayableFeedMode, subscribedChannelIds: string[]): Promise<RZAudio[]> => {
    const audiosDTOs = await getFeedAudioListAction(feedMode, subscribedChannelIds);
    return (await Promise.all(audiosDTOs.map(async (dto) => {
        return await audioFromDTO(dto);
    }))).filter((audio): audio is RZAudio => audio !== null);
}



