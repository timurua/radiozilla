import { atom, useSetRecoilState } from 'recoil';
import { User } from 'firebase/auth';
import LocalStorage from '../utils/LocalStorage';

export const firebaseUserState = atom<User | null>({
  key: 'firebaseUserState',
  default: null,
});

export const firebaseUserLoadingState = atom<boolean>({
  key: 'firebaseUserLoadingState',
  default: true,
});

export const cookieConsentState = atom<boolean>({
  key: 'cookieConsentState',
  default: LocalStorage.getCookieConsent(),
});

export const isOnlineState = atom<boolean>({
    key: 'isOnlineState',
    default: navigator.onLine,
});

window.addEventListener("online", () => {
    const setIsOnlineState = useSetRecoilState(isOnlineState);
    setIsOnlineState(true);
});

window.addEventListener("offline", () => {
    const setIsOnlineState = useSetRecoilState(isOnlineState);
    setIsOnlineState(false);
});




