// src/features/auth/components/AuthProvider.tsx
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAppDispatch } from '@/hooks/reduxHooks' // On va créer ce hook
import { setUser } from '@/features/auth/authSlice'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // onAuthStateChanged est un écouteur de Firebase qui se déclenche
    // à la connexion, à la déconnexion, et au chargement initial de la page.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // L'utilisateur est connecté
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }))
      } else {
        // L'utilisateur est déconnecté
        dispatch(setUser(null))
      }
    })

    // On retourne la fonction de nettoyage pour se désabonner de l'écouteur
    // quand le composant est démonté.
    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}