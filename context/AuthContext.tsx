import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        const currentUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: userData?.displayName || firebaseUser.displayName || 'User',
          photoURL: userData?.photoURL || firebaseUser.photoURL || undefined,
          createdAt: userData?.createdAt?.toDate() || new Date(),
        };

        setUser(currentUser);

        // AsyncStorage should not block loading
        AsyncStorage.setItem('user', JSON.stringify(currentUser)).catch(console.warn);
      } else {
        setUser(null);
        AsyncStorage.removeItem('user').catch(console.warn);
      }
    } catch (err) {
      console.error('Auth state error:', err);
      setUser(null);
    } finally {
      setLoading(false); // <-- always set loading false
    }
  });

  return unsubscribe;
}, []);


  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(userCredential.user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        createdAt: new Date(),
        photoURL: null
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};