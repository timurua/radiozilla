import { collection, doc, getDoc, getDocs, query, setDoc, where, serverTimestamp, orderBy, DocumentData } from 'firebase/firestore';
import { PlayableFeedMode, RZAudio, RZAuthor, RZChannel, RZUserData, } from "../data/model";
import { db } from '../firebase';
import { TfIdfDocument } from '../tfidf/types';
import logger from '../utils/logger';
import { LRUCache } from 'lru-cache';

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

    const docRef = doc(db, `/authors/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const authorData = {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
        };
        const author = RZAuthor.fromObject(authorData, docSnap.id);
        authorCache.set(id, author);
        return author;
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

export const audioFromData = async (data: DocumentData, id: string): Promise<RZAudio> => {
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
}

// Modify getAudio with caching
export const getAudio = async (id: string): Promise<RZAudio> => {
    const cached = audioCache.get(id);
    if (cached) {
        return cached;
    }

    const docRef = doc(db, `/audios/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const audio = await audioFromData(data, docSnap.id);
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

    const audios = await Promise.all(querySnapshot.docs.map(doc =>
        audioFromData(doc.data(), doc.id)
    ));
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

    resultAudios = await Promise.all(filteredDocs.map(async (doc) => {
        const data = doc.data();
        return await audioFromData(data, doc.id);
    }));

    if (feedMode == PlayableFeedMode.Subscribed) {
        const subscribedChannelIdsSet = new Set(subscribedChannelIds);
        resultAudios = resultAudios.filter(rzAudio => subscribedChannelIdsSet.has(rzAudio.channel.id));
    }

    return resultAudios;
}



