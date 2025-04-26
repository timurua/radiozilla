import { makeAutoObservable } from "mobx";
import { saveUserData } from '../data/actions';
import { RZUserData } from "../data/model";

// MobX store for user data
class UserDataStore {
  userData: RZUserData = RZUserData.empty();

  constructor() {
    makeAutoObservable(this);
  }

  setUserData(newData: RZUserData) {
    if (JSON.stringify(newData) !== JSON.stringify(this.userData)) {
      this.userData = newData;
      saveUserData(newData);
    }
  }

  get subscribedChannelIds() {
    return this.userData.subscribedChannelIds;
  }

  get playedAudioIds() {
    return this.userData.playedAudioIds;
  }

  addPlayedAudioId(audioId: string) {
    if (!this.userData.playedAudioIds.includes(audioId)) {
      this.userData.playedAudioIds.push(audioId);
      saveUserData(this.userData);
    }
  }
}

export const userDataStore = new UserDataStore();
