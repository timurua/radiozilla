import { atom, selector } from "recoil";
import { Users, Playables } from "../data/mocks";
import { Playable, PlayableSorting, PlayingMode } from "../data/model";

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
        return await Playables.list(user.email);
    },
});

export const playingModeState = atom({
    key: 'PlayingMode',
    default: PlayingMode.Idle,
});

export const currentPlayableIDState = atom({
    key: 'CurrentPlayableID',
    default: '',
});

export const currentPlayableState = selector<Playable|null>({
    key: 'CurrentPlayable',
    get: async ({ get }) => {
        const playables = await get(playablesState);
        const playingPlayableID = get(currentPlayableIDState);
        if(!playingPlayableID){
            if(playables.length > 0){
                return playables[0];
            }
        }
        return playables.find(playable => playable.id === playingPlayableID) || null;
    }
});

