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


