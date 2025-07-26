// src/features/auth/components/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/hooks/reduxHooks'

export default function AdminRoute() {
  const { user, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return <div>Chargement...</div> // Ou un spinner
  }
  
  // L'utilisateur doit être connecté ET être un admin
  if (user && user.isAdmin) {
    return <Outlet />
  }

  // Si non admin, redirige vers la page d'accueil (ou une page "accès refusé")
  return <Navigate to="/" replace />
}