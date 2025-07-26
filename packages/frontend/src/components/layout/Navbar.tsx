// src/components/layout/Navbar.tsx
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks'
import { setUser } from '@/features/auth/authSlice'

export default function Navbar() {
  const { user, loading } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    await signOut(auth)
    // L'écouteur onAuthStateChanged dans AuthProvider s'occupera de mettre
    // l'état Redux à jour, mais on peut le faire manuellement pour plus de réactivité.
    dispatch(setUser(null))
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              VOYENGO
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/offers" className="text-gray-600 hover:text-gray-900">
                Trouver un voyage
              </Link>
              {/* Plus tard: "Envoyer un colis" */}
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              // Si l'utilisateur est connecté
              <>
                <span>Bonjour, {user.displayName || user.email}</span>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              // Si l'utilisateur n'est pas connecté
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Connexion
                </Link>
                <Link
                  to="/register" // On prépare la route pour l'inscription
                  className="px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}