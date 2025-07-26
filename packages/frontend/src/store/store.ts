// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice' // Importe notre reducer d'auth

export const store = configureStore({
  reducer: {
    // C'est ici qu'on listera tous nos reducers
    auth: authReducer,
  },
  // Middleware pour éviter les erreurs avec les données non-sérialisables de Firebase
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Exporter les types pour notre usage dans l'application (très important avec TypeScript)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch