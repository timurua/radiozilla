import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { atom, selector } from "recoil";
import { audioFromData } from '../data/firebase';
import { PlayableFeedMode, RZAudio } from "../data/model";
import { db } from '../firebase';
import { userDataSubscribedChannelIdsSelector } from './userData';

interface AudioRetreival {
    mode: PlayableFeedMode | null;
}

export const audioRetrivalState = atom<AudioRetreival>({
    key: 'CurrentAudioMode',
    default: {        
        mode: PlayableFeedMode.Latest,
    },
});

export const rzAudiosState = selector({
    key: 'RzAudios',
    get: async ({get}) => {
        const audioRetrieval = get(audioRetrivalState);
        
        let resultAudios: RZAudio[] = [];
        //const playedAudioIdsSet = new Set(userData.playedAudioIds);

        const audiosRef = collection(db, 'audios');
        const audioQuery = query(audiosRef,             
            orderBy('publishedAt', 'desc'),
            orderBy('__name__', 'desc') // Use document ID as secondary sort to handle null values
          );
        const querySnapshot = await getDocs(audioQuery);   
        //const filteredDocs = querySnapshot.docs.filter(doc => !playedAudioIdsSet.has(doc.id));
        const filteredDocs = querySnapshot.docs;

        resultAudios = await Promise.all(filteredDocs.map(async (doc) => {            
            const data = doc.data();
            return await audioFromData(data, doc.id);
        }));

        if(audioRetrieval.mode == PlayableFeedMode.Subscribed) {
            const subscribedChannelIds = new Set(get(userDataSubscribedChannelIdsSelector));
            resultAudios = resultAudios.filter(rzAudio => subscribedChannelIds.has(rzAudio.channel.id));
        }

        return resultAudios;
    },
});
