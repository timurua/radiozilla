// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { LRUCache } from 'lru-cache'
import { getAuth } from "firebase/auth";
import log from 'loglevel';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDbO0ULQjRbxFeVlIFuq4z_CdMcv-f1JU",
  authDomain: "radiozilla-92c5f.firebaseapp.com",
  projectId: "radiozilla-92c5f",
  storageBucket: "radiozilla-92c5f.firebasestorage.app",
  messagingSenderId: "580763484917",
  appId: "1:580763484917:web:d7945b7c99cfe9ac8bfbbc",
  measurementId: "G-1QEFXJ0QSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const urlCache = new LRUCache<string, string>({
  max: 10000, // Maximum number of items in cache
  ttl: 60 * 1000, // Expiration time in milliseconds
});

const storageUtils = {
  toDownloadURL: async (url: string): Promise<string> => {
    if (url.startsWith('gs://')) {

      const cachedUrl = urlCache.get(url);
      if (cachedUrl) {
        log.debug(`Retrieved from cache originalUrl: ${url}, downloadUrl': ${cachedUrl} `);
        return Promise.resolve(cachedUrl);
      }
      const downloadUrl = await getDownloadURL(ref(storage, url));
      urlCache.set(url, downloadUrl);
      log.debug(`Retrieved from Firebase originalUrl: ${url}, downloadUrl': ${downloadUrl} `);
      return Promise.resolve(downloadUrl);
    }
    return Promise.resolve(url);
  },
};

export { db, storage, storageUtils, auth };
