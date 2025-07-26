// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from 'firebase/auth'

// Définir la forme des données utilisateur que nous voulons stocker
// On ne stocke pas tout l'objet User de Firebase, juste ce qui est utile
interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  isAdmin: boolean // <-- Ajouter ce champ

}

// Définir la forme de l'état de notre slice
interface AuthState {
  user: AuthUser | null
  loading: boolean
}

// Définir l'état initial
const initialState: AuthState = {
  user: null,
  loading: true, // On commence à 'true' pour vérifier l'état de connexion au démarrage
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  // Les "reducers" sont des fonctions qui modifient l'état
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

// On exporte les actions pour pouvoir les utiliser dans nos composants
export const { setUser, setLoading } = authSlice.actions

// On exporte le reducer pour le connecter au store principal
export default authSlice.reducer