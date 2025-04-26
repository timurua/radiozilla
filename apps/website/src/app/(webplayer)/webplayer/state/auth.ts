import { makeAutoObservable } from 'mobx';
import LocalStorage from '../utils/LocalStorage';
import { RZUser } from '../data/model';

class AuthStore {
  user: RZUser | null = null;
  userLoading: boolean = true;
  cookieConsent: boolean = LocalStorage.getCookieConsent();
  isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setIsOnline(true);
      });
      window.addEventListener('offline', () => {
        this.setIsOnline(false);
      });
    }
  }

  setUser(user: RZUser | null) {
    this.user = user;
  }
  setUserLoading(loading: boolean) {
    this.userLoading = loading;
  }
  setCookieConsent(consent: boolean) {
    this.cookieConsent = consent;
    LocalStorage.setCookieConsent(consent);
  }
  setIsOnline(isOnline: boolean) {
    this.isOnline = isOnline;
  }
}

export const authStore = new AuthStore();
