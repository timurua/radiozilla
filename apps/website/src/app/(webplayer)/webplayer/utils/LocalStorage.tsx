'use client';

class LocalStorage {
    static setCookieConsent(enabled: boolean): void {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('cookieConsent', JSON.stringify(enabled));
        }
    }

    static getCookieConsent(): boolean {
        const value = typeof window !== 'undefined' ? window.localStorage.getItem('cookieConsent') : null;
        return value ? JSON.parse(value) : false;
    }
}

export default LocalStorage;