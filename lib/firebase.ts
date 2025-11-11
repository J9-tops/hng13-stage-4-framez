import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-ignore: getReactNativePersistence exists in the RN bundle
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBJPpBZU2OfgIY0REtaAVV7ZJXxJiGmhY",
  authDomain: "framez-de4f3.firebaseapp.com",
  projectId: "framez-de4f3",
  storageBucket: "framez-de4f3.firebasestorage.app",
  messagingSenderId: "517664186277",
  appId: "1:517664186277:web:5305fa6a2b5d139434d24c",
  measurementId: "G-TR52ZKFVVM"
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

