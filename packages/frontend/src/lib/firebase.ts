// src/lib/firebase.ts

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// 1. On définit la structure de la configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 2. On vérifie que la clé principale est bien là
if (!firebaseConfig.apiKey) {
  throw new Error('VITE_FIREBASE_API_KEY is not set in .env.local. Please check your environment variables.')
}

// 3. On initialise l'application avec cette configuration
const app: FirebaseApp = initializeApp(firebaseConfig)

// 4. On exporte les services pour les utiliser ailleurs
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

export default app