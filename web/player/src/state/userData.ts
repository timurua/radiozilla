import { atom } from "recoil";
import { saveUserData } from '../data/firebase';
import { RZUserData } from "../data/model";


export const userDataState = atom<RZUserData>({
    key: 'userData',
    default: RZUserData.empty(),
    effects: [
        ({ onSet }) => {
          onSet((newValue, oldValue) => {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              saveUserData(newValue);
            }
          });
        }
      ]
});
