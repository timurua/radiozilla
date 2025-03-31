class LocalStorage {
    static setCookieConsent(enabled: boolean): void {
        localStorage.setItem('cookieConsent', JSON.stringify(enabled));
    }

    static getCookieConsent(): boolean {
        const value = localStorage.getItem('cookieConsent');
        return value ? JSON.parse(value) : false;
    }
}

export default LocalStorage;