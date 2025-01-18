import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { atom, selector } from "recoil";
import { PlayableSorting, RZAudio } from "../data/model";
import { db } from '../firebase';
import Client from '../client';
import { audioFromData } from '../data/firebase';

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
