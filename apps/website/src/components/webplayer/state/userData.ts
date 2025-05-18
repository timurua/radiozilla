import { makeAutoObservable } from "mobx";
import { upsertFrontendUser } from '../data/client';
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
      upsertFrontendUser(newData);
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
      this.setUserData(this.userData);
    }
  }
}

export const userDataStore = new UserDataStore();
