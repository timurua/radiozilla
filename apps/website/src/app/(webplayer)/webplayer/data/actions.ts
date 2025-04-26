import { collection, doc, getDoc, getDocs, query, setDoc, where, serverTimestamp, orderBy, DocumentData } from 'firebase/firestore';
import { PlayableFeedMode, RZAudio, RZAuthor, RZChannel, RZUserData, } from "./model";
import { TfIdfDocument } from '../tfidf/types';
import logger from '../utils/logger';
import { LRUCache } from 'lru-cache';

import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    FrontendAudio,
    FrontendAuthor,
    FrontendChannel,
    frontendAudios,
    frontendAuthors,
    frontendChannels,
} from '@/lib/db/schema';
import { FrontendAuthorDTO, FrontendChannelDTO } from './interfaces';


export const getAuthor = async (id: string): Promise<FrontendAuthorDTO> => {
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

export const getChannel = async (id: string): Promise<FrontendChannelDTO> => {
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


export const getUserData = async (id: string): Promise<RZUserData> => {
    const docRef = doc(db, `/users/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const displayName = data.displayName || null;
        const email = data.email || null;
        const imageURL = data.imageURL || null;
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;
        const playedAudioIds = data.playedAudioIds || [];
        const likedAudioIds = data.likedAudioIds || [];
        const searchHistory = data.searchHistory || [];
        const subscribedChannelIds = data.subscribedChannelIds || [];
        return new RZUserData(id, displayName, email, imageURL, createdAt, subscribedChannelIds, likedAudioIds, playedAudioIds, searchHistory);
    } else {
        logger.error(`No user found with ID: ${id}`);
        throw new Error(`No user found with ID: ${id}`);
    }
}

export const saveUserData = async (userData: RZUserData) => {
    const userDocRef = doc(db, `/users/${userData.id}`);
    const playedAudioIds = new Set(userData.playedAudioIds || []);
    const likedAudioIds = new Set(userData.likedAudioIds || []);
    const searchHistory = userData.searchHistory || [];
    const subscribedChannelIds = new Set(userData.subscribedChannelIds || []);

    await setDoc(userDocRef, {
        id: userData.id,
        displayName: userData.displayName,
        email: userData.email,
        imageURL: userData.imageURL,
        createdAt: userData.createdAt,
        playedAudioIds: Array.from(playedAudioIds),
        likedAudioIds: Array.from(likedAudioIds),
        searchHistory,
        subscribedChannelIds: Array.from(subscribedChannelIds),
        lastActiveAt: serverTimestamp()
    });
}

// Modify getChannel with caching
export const getChannel = async (id: string): Promise<RZChannel> => {
    const cached = channelCache.get(id);
    if (cached) {
        return cached;
    }

    const [dbChannel] = await db
        .select()
        .from(frontendAuthors)
        .where(
            eq(frontendAuthors.normalizedUrlHash, id)
        )
        .limit(1);


    const docRef = doc(db, `/channels/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const channelData = {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
        };
        const channel = RZChannel.fromObject(channelData, docSnap.id);
        channelCache.set(id, channel);
        return channel;
    } else {
        logger.error(`No channel found with ID: ${id}`);
        throw new Error(`No document found with ID: ${id}`);
    }
}

export const getChannels = async (ids: string[]): Promise<RZChannel[]> => {
    const channels = await Promise.all(ids.map(async (id) => {
        return getChannel(id);
    }));
    return channels;
}

export const getAllChannelIds = async (): Promise<string[]> => {
    const ref = collection(db, 'channels');
    const querySnapshot = await getDocs(ref);
    return querySnapshot.docs.map(doc => doc.id);
}

export const audioFromData = async (data: DocumentData, id: string): Promise<RZAudio | null> => {
    try {
        const createdAt = data.createdAt.toDate();
        const authorId = data.author;
        const channelId = data.channel;
        const audioText = data.audioText;
        const durationSeconds = data.durationSeconds;
        const webUrl = data.webUrl;
        const publishedAt = data.publishedAt ? data.publishedAt.toDate() : null;
        const author = await getAuthor(authorId);
        const channel = await getChannel(channelId);
        const audioData = {
            name: data.name,
            audioUrl: data.audioUrl,
            imageUrl: data.imageUrl,
            topics: data.topics,
            audioText,
            durationSeconds,
            webUrl,
            publishedAt
        };
        const audio = RZAudio.fromObject(audioData, id, createdAt, author, channel);
        audioCache.set(id, audio);
        return audio;
    } catch (error) {
        logger.error(`Error creating audio from data: ${error}`);
        return null;
    }
}

// Modify getAudio with caching
export const getAudio = async (id: string): Promise<RZAudio | null> => {
    const cached = audioCache.get(id);
    if (cached) {
        return cached;
    }

    const docRef = doc(db, `/audios/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const audio = await audioFromData(data, docSnap.id);
        if (!audio) {
            return null;
        }
        audioCache.set(id, audio);
        return audio;
    } else {
        logger.error(`No audio found with ID: ${id}`);
        throw new Error(`No audio found with ID: ${id}`);
    }
}

export const getAudioListForChannel = async (channelId: string): Promise<RZAudio[]> => {

    const audioRef = collection(db, 'audios');
    const queryAudios = query(audioRef,
        where('channel', '==', channelId),
        orderBy('publishedAt', 'desc'),
        orderBy('__name__', 'desc'));
    const querySnapshot = await getDocs(queryAudios);

    const resultAudiosWithNulls = await Promise.all(querySnapshot.docs.map(doc =>
        audioFromData(doc.data(), doc.id)
    ));
    const audios = resultAudiosWithNulls.filter((audio): audio is RZAudio => audio !== null);
    return audios;
}

export const getSearchDocuments = async (): Promise<TfIdfDocument[]> => {
    const audioRef = collection(db, 'audios');
    const querySnapshot = await getDocs(query(audioRef));
    return querySnapshot.docs.map(doc => ({
        docId: doc.id,
        text: doc.data().name
    }));
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
    let resultAudios: RZAudio[] = [];

    const audiosRef = collection(db, 'audios');
    const audioQuery = query(audiosRef,
        orderBy('publishedAt', 'desc'),
        orderBy('__name__', 'desc')
    );
    const querySnapshot = await getDocs(audioQuery);
    //const filteredDocs = querySnapshot.docs.filter(doc => !playedAudioIdsSet.has(doc.id));
    const filteredDocs = querySnapshot.docs;

    const resultAudiosWithNulls = await Promise.all(filteredDocs.map(async (doc) => {
        const data = doc.data();
        return await audioFromData(data, doc.id);
    }));

    resultAudios = resultAudiosWithNulls.filter((audio): audio is RZAudio => audio !== null);

    if (feedMode == PlayableFeedMode.Subscribed) {
        const subscribedChannelIdsSet = new Set(subscribedChannelIds);
        resultAudios = resultAudios.filter(rzAudio => subscribedChannelIdsSet.has(rzAudio.channel.id));
    }

    return resultAudios;
}



