import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import log from 'loglevel';
import { atom, selector } from "recoil";
import { PlayableSorting, RZAudio, RZAuthor, RZChannel, } from "../data/model";
import { db } from '../firebase';
import logger from '../utils/logger';

export const audioSortingState = atom({
    key: 'CurrentAudioSorting',
    default: PlayableSorting.Date,
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



export const rzAudiosState = selector({
    key: 'RzAudios',
    get: async ({get}) => {
        const sorting = get(audioSortingState);
        const querySnapshot = await getDocs(collection(db, 'audios'));

        const audios: RZAudio[] = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const createdAt = data.createdAt.toDate();
            const authorId = data.author;
            const channelId = data.channel;
            const audioText = data.audioText;
            const durationSeconds = data.durationSeconds;
            const webUrl = data.webUrl;
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
            };
            return RZAudio.fromObject(audioData, doc.id, createdAt, author, channel);
        }));

        const sortedAudios = [...audios].sort((a, b) => {
            switch (sorting) {
                case PlayableSorting.Date:
                    return b.createdAt.getTime() - a.createdAt.getTime();
                case PlayableSorting.Topic:
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        log.info(`Fetched ${sortedAudios.length} audios, sorted by ${sorting}`);
        return sortedAudios;
    },
});