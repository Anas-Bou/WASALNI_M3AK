// NOUVELLE VERSION CORRECTE
// src/features/auth/pages/LoginPage.tsx

import LoginForm from '@/features/auth/components/LoginForm' // <-- 1. Importer le composant

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
        </div>
        <LoginForm /> {/* <-- 2. Utiliser le composant ici */}
      </div>
    </div>
  )
}