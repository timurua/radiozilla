import { collection, getDocs } from 'firebase/firestore';
import { atom, selector } from "recoil";
import { PlayableSorting } from "../data/model";
import { db } from '../firebase';
import { audioFromData } from '../data/firebase';

interface AudioRetreival {
    sorting: PlayableSorting | null;
}

export const audioRetrivalState = atom<AudioRetreival>({
    key: 'CurrentAudioSorting',
    default: {        
        sorting: PlayableSorting.Date,
    }
});

export const rzAudiosState = selector({
    key: 'RzAudios',
    get: async ({get}) => {
        const audioRetrieval = get(audioRetrivalState);
        var resultAudios = [];

        const querySnapshot = await getDocs(collection(db, 'audios'));
        resultAudios = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            return await audioFromData(data, doc.id);
        }));            

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
