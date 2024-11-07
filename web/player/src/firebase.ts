// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { createContext, ReactNode, useContext, FC } from "react";
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

interface FirebaseContextProps {
  db: Firestore;
  storage: FirebaseStorage;
};

// Create Context
const FirebaseContext = createContext<FirebaseContextProps | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
};

export const FirebaseProvider: FC<FirebaseProviderProps> = ({ children }) => (
  <FirebaseContext.Provider value={{ db, storage }}>
    {children}
  </FirebaseContext.Provider>
);

// Custom Hook for accessing Firebase
export const useFirebase = () => useContext(FirebaseContext);
