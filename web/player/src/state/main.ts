import { atom, selector } from "recoil";
import { Users, Playables } from "../data/mocks";
import { PlayableSorting } from "../data/model";

export const currentUserEmailState = atom({
    key: 'CurrentUserEmail',
    default: 'timurua@gmail.com',
});

export const currentPlayableSortingState = atom({
    key: 'CurrentPlayableSorting',
    default: PlayableSorting.Date,
});

export const currentUserState = selector({
    key: 'CurrentUser',
    get: async () => {
        return await Users.getCurrent();
    },
});

export const currentPlayablesState = selector({
    key: 'CurrentUserPlayables',
    get: async ({ get }) => {
        const user = await get(currentUserState);
        return await Playables.list(user.email);
    },
});

export const currentPlayingPlayableIDState = atom({
    key: 'CurrentPlayingPlayableID',
    default: '',
});

export const currentPlayingPlayableState = selector({
    key: 'CurrentPlayingPlayable',
    get: async ({ get }) => {
        const playables = await get(currentPlayablesState);
        const playingPlayableID = get(currentPlayingPlayableIDState);
        return playables.find(playable => playable.id === playingPlayableID);
    }
});

