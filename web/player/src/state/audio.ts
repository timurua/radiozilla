import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import log from 'loglevel';
import { atom, selector } from "recoil";
import { Users } from "../data/mocks";
import { PlayableSorting, RZAudio, RZAuthor, RZChannel, } from "../data/model";
import { db } from '../firebase';

export const userEmailState = atom({
    key: 'CurrentUserEmail',
    default: 'timurua@gmail.com',
});

export const userState = selector({
    key: 'CurrentUser',
    get: async () => {
        return await Users.getCurrent();
    },
});

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
        console.log(`No document found with ID: ${reference}`);
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
        console.log(`No document found with ID: ${reference}`);
        throw new Error(`No document found with ID: ${reference}`);
    }
}

export const rzAudiosState = selector({
    key: 'RzAudios',
    get: async () => {
        const querySnapshot = await getDocs(collection(db, 'audios'));

        const audios: RZAudio[] = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const createdAt = data.createdAt.toDate();
            const authorId = data.author;
            const channelId = data.channel;
            const author = await getAuthor(authorId);            
            const channel = await getChannel(channelId);
            const audioData = {
                name: data.name,
                audioUrl: data.audioUrl,
                imageUrl: data.imageUrl,
                topics: data.topics,
            };
            return RZAudio.fromObject(audioData, doc.id, createdAt, author, channel);
        }));
        log.info(`Fetched ${audios.length} audios`);
        return audios;
    },
});