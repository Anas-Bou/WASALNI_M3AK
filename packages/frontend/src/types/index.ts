// src/types/index.ts
import type { TravelOffer as SharedTravelOffer } from '@voyengo/shared/types/offer'

// Le type de Firestore pour une date est un objet Timestamp
interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
}

// On étend le type partagé pour inclure les champs ajoutés par le serveur
export interface TravelOfferWithId extends SharedTravelOffer {
  id: string
  userId: string
  author: {
    displayName: string | null
    // photoURL?: string | null
  }
  status: 'active' | 'completed' | 'cancelled'
  createdAt: FirestoreTimestamp
  travelDate: FirestoreTimestamp // Firestore convertit les Dates en Timestamps
}