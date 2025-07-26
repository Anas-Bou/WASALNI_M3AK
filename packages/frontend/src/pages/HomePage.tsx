// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/hooks/reduxHooks' // Importer le hook

export default function HomePage() {
  const { user } = useAppSelector((state) => state.auth) // Lire l'état d'authentification

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800">VOYENGO</h1>
      <p className="text-gray-600 mt-2 text-lg md:text-xl">
        Connecter voyageurs et expéditeurs, simplement.
      </p>

      <div className="mt-8 space-x-4">
        {user ? (
          // Contenu si l'utilisateur est connecté
          <>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
            >
              Aller à mon tableau de bord
            </Link>
            <Link
              to="/offers"
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors border"
            >
              Voir les offres
            </Link>
          </>
        ) : (
          // Contenu si l'utilisateur n'est pas connecté
          <>
            <Link
              to="/register"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors border"
            >
              Se connecter
            </Link>
          </>
        )}
      </div>
    </div>
  )
}