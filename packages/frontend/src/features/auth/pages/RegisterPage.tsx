// src/features/auth/pages/RegisterPage.tsx
import RegisterForm from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}