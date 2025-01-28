import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { RZAudio, RZAuthor, RZChannel, } from "../data/model";
import { db } from '../firebase';
import logger from '../utils/logger';
import { TfIdfDocument } from '../tfidf/types';

export const getAuthor = async (id: string): Promise<RZAuthor> => {
    const docRef = doc(db, `/authors/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const authorData = {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
        };
        return RZAuthor.fromObject(authorData, docSnap.id);
    } else {
        logger.log(`No author found with ID: ${id}`);
        throw new Error(`No author found with ID: ${id}`);
    }
}

export const getChannel = async (id: string): Promise<RZChannel> => {
    const docRef = doc(db, `/channels/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const channelData = {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
        };
        return RZChannel.fromObject(channelData, docSnap.id);
    } else {
        logger.log(`No channel found with ID: ${id}`);
        throw new Error(`No document found with ID: ${id}`);
    }
}


export const audioFromData = async (data: any, id: string): Promise<RZAudio> => {
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
    return RZAudio.fromObject(audioData, id, createdAt, author, channel);
}

export const getAudio = async (id: string): Promise<RZAudio> => {
    const docRef = doc(db, `/audios/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return await audioFromData(data, docSnap.id);        
    } else {
        logger.log(`No audio found with ID: ${id}`);
        throw new Error(`No audio found with ID: ${id}`);
    }
}

export const getAudioListForChannel = async (channelId: string): Promise<RZAudio[]> => {
    
    const audioRef = collection(db, 'audios');
    const queryAudios = query(audioRef, where('channel', '==', channelId));
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
        return getAudio(id);
    }));    
    return audios.filter((audio): audio is RZAudio => audio !== null);
}

export const saveListenedAudioIdsByUser = async (userId: string, audioId: string): Promise<TfIdfDocument[]> => {
    const userDocRef = doc(db, `/users/${userId}`);
    const userDocData = (await getDoc(userDocRef)).data() || {};
    const listenedAudioIds = new Set(userDocData.listenedAudioIds || []);
    listenedAudioIds.add(audioId);
    await updateDoc(userDocRef, {
        listenedAudioIds: Array.from(listenedAudioIds)
    });
    return [];
}

export const getListenedAudioIdsByUser = async (userId: string): Promise<string[]> => {
    const userDocRef = doc(db, `/users/${userId}`);
    const userDocData = (await getDoc(userDocRef)).data() || {};
    return userDocData.listenedAudioIds || [];    
}

