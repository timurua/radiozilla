import { atom, selector } from "recoil";
import { Users, Playables } from "../data/mocks";

const currentUserEmailState = atom({
    key: 'CurrentUserEmail',
    default: 1,
});

const currentUserState = selector({
    key: 'CurrentUser',
    get: async ({ }) => {
        return await Users.getCurrent();
    },
});

const currentUserPlayablesState = selector({
    key: 'CurrentUserPlayables',
    get: async ({ get }) => {
        const user = get(currentUserState);
        return await Playables.list(user.email);
    },
});

export {
    currentUserEmailState,
    currentUserState,
    currentUserPlayablesState
};
