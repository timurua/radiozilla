import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import log from 'loglevel';
import { atom, selector } from "recoil";
import { PlayableSorting, RZAudio, RZAuthor, RZChannel, } from "../data/model";
import { db } from '../firebase';
import logger from '../utils/logger';
import Client from '../client';

interface AudioRetreival {
    searchString: string;
    sorting: PlayableSorting | null;
}

export const audioRetrivalState = atom<AudioRetreival>({
    key: 'CurrentAudioSorting',
    default: {        
        searchString: '',
        sorting: PlayableSorting.Date,
    }
});

const getAuthor = async (reference: string): Promise<RZAuthor> => {
    const docRef = doc(db, reference);
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
        logger.log(`No document found with ID: ${reference}`);
        throw new Error(`No document found with ID: ${reference}`);
    }
}

const getChannel = async (reference: string): Promise<RZChannel> => {
    const docRef = doc(db, reference);
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
        logger.log(`No document found with ID: ${reference}`);
        throw new Error(`No document found with ID: ${reference}`);
    }
}

const audioFromData = async (data: any, id: string): Promise<RZAudio> => {
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

export const rzAudiosState = selector({
    key: 'RzAudios',
    get: async ({get}) => {
        const audioRetrieval = get(audioRetrivalState);
        var resultAudios = [];
        if (audioRetrieval.searchString) {
            const results = await Client.frontendAudiosSimilarForTextApiV1FrontendAudioResultsSimilarForTextPost(
                audioRetrieval.searchString
            );
            const audios = await Promise.all(results.data.map(async (result) => {
                const docRef = doc(db, `/audios/${result.normalized_url_hash}`);
                const data = (await getDoc(docRef)).data();
                if (!data) {
                    return null;
                }
                return await audioFromData(data, result.normalized_url_hash);
            }));
            resultAudios = audios.filter((audio): audio is RZAudio => audio !== null);
        } else {
            const querySnapshot = await getDocs(collection(db, 'audios'));
            resultAudios = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                return await audioFromData(data, doc.id);
            }));            
        }
        if (!audioRetrieval.sorting) {
            return resultAudios;
        }

        const sortedAudios = [...resultAudios].sort((a, b) => {
            switch (audioRetrieval.sorting) {
                case PlayableSorting.Date:
                    if (a.publishedAt === b.publishedAt) {
                        return 0;
                    }
                    if (!a.publishedAt) {
                        return 1;
                    }
                    if (!b.publishedAt) {
                        return -1;
                    }                    
                    return b.publishedAt.getTime() - a.publishedAt.getTime();
                case PlayableSorting.Name:
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });        
        return sortedAudios;
    },
});