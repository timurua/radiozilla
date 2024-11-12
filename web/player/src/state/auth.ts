import { atom, useSetRecoilState } from 'recoil';
import LocalStorage from '../utils/LocalStorage';
import { RZUser } from '../data/model';

export const userState = atom<RZUser | null>({
  key: 'userState',
  default: null,
});

export const userLoadingState = atom<boolean>({
  key: 'userLoadingState',
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




