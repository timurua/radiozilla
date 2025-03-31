import { atom, selector } from "recoil";
import { saveUserData } from '../data/firebase';
import { RZUserData } from "../data/model";

export const userDataState = atom<RZUserData>({
    key: 'userData',
    default: RZUserData.empty(),
    effects: [
        ({ onSet }) => {
          onSet(async (newValue, oldValue) => {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              await saveUserData(newValue);
            }
          });
        },
      ]
});

export const userDataSubscribedChannelIdsSelector = selector({
  key: 'userDataSubscribedChannelIdsSelectort',
  get: ({get}) => {
    const subscribedChannelIds = get(userDataState).subscribedChannelIds;
    return subscribedChannelIds;
  },
});

export const userDataPlayedAudioIdsSelector = selector({
  key: 'userDataPlayedAudioIdsSelector',
  get: ({get}) => {
    const playedAudioIds = get(userDataState).playedAudioIds;
    return playedAudioIds;
  },
});
