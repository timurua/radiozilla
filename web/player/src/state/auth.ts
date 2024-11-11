import { atom } from 'recoil';
import { User } from 'firebase/auth';
import LocalStorage from '../utils/LocalStorage';

export const userState = atom<User | null>({
  key: 'userState',
  default: null,
});

export const authLoadingState = atom<boolean>({
  key: 'authLoadingState',
  default: true,
});

export const cookieConsentState = atom<boolean>({
  key: 'cookieConsentState',
  default: LocalStorage.getCookieConsent(),
});