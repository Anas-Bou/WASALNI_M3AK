// src/features/auth/components/AuthProvider.tsx
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAppDispatch } from '@/hooks/reduxHooks' // On va créer ce hook
import { setUser } from '@/features/auth/authSlice'
import { onIdTokenChanged } from 'firebase/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult()
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          isAdmin: tokenResult.claims.admin === true, // <-- Lire le claim ici
        }))
      } else {
        dispatch(setUser(null))
      }
    })
    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}