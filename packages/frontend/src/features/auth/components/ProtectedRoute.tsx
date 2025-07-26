// src/features/auth/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/reduxHooks'

export default function ProtectedRoute() {
  const { user, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    // Affiche un état de chargement pendant que l'on vérifie l'authentification
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!user) {
    // Si l'utilisateur n'est pas connecté, le redirige vers la page de connexion
    return <Navigate to="/login" replace />
  }

  // Si l'utilisateur est connecté, affiche le contenu de la route enfant
  return <Outlet />
}