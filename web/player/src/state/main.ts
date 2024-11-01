import { atom, selector } from "recoil";
import { Users } from "../data/mocks";
import { PlayableSorting, } from "../data/model";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const userEmailState = atom({
    key: 'CurrentUserEmail',
    default: 'timurua@gmail.com',
});

export const userState = selector({
    key: 'CurrentUser',
    get: async ({get}) => {
        const userEmail = await get(userEmailState);
        return await Users.getCurrent();
    },
});

export const playableSortingState = atom({
    key: 'CurrentPlayableSorting',
    default: PlayableSorting.Date,
});

export const playablesState = selector({
    key: 'Playables',
    get: async ({ get }) => {
        const user = await get(userState);
        return await getDocs(collection(db, 'audios'));;
    },
});