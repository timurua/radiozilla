import { atom, selector } from "recoil";
import { Users, Playables } from "../data/mocks";
import { PlayableSorting } from "../data/model";

const currentUserEmailState = atom({
    key: 'CurrentUserEmail',
    default: 'timurua@gmail.com',
});

export const currentPlayableSortingState = atom({
    key: 'CurrentPlayableSorting',
    default: PlayableSorting.Date,
});

const currentUserState = selector({
    key: 'CurrentUser',
    get: async () => {
        return await Users.getCurrent();
    },
});

const currentUserPlayablesState = selector({
    key: 'CurrentUserPlayables',
    get: async ({ get }) => {
        const user = await get(currentUserState);
        return await Playables.list(user.email);
    },
});

export {
    currentUserEmailState,
    currentUserState,
    currentUserPlayablesState
};
